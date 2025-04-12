const clearSearchResults = () => {
    const resultContainer = document.getElementsByClassName('search-results')[0]
    resultContainer.innerHTML = ''
}

const createResultTile = result => {
    const resultTile = document.createElement('div')
    const resultSpan = document.createElement('span')
    resultTile.classList.add('search-result-tile')
    resultSpan.classList.add('search-result-text')
    
    if (typeof result === 'string') {
        // The only time result is a string is if no search
        // results are found or there is a fetch error
        resultSpan.innerHTML = result
    } else {
        resultTile.innerHTML += `<img src="./assets/images/${result.imageUrl}">`
        resultSpan.innerHTML += `<h2>${result.name}</h2><br>`
        resultSpan.innerHTML += `<p>${result.description}</p><br>`
        resultSpan.innerHTML += `<button>Visit</button>`
    }

    resultTile.appendChild(resultSpan)
    
    return resultTile
}

const performSearch = () => {
    const input = document.getElementById('search-input').value.toLowerCase().toString()
    const resultContainer = document.getElementsByClassName('search-results')[0]
    const categories = ['cities', 'temples', 'beaches']
    resultContainer.innerHTML = ''

    if (input.trim() === '') { return }

    fetch('./assets/data/location-data.json')
        .then(response => response.json())
        .then(data => {
            const results = []
            // Put the data in an array to be able to loop through it
            const dataArray = [data]

            while (dataArray.length > 0) {
                const dataItem = dataArray.pop()

                // If it's another array, put the contents back in dataArray for the next loop
                if (Array.isArray(dataItem)) {
                    dataItem.forEach(categoryItem => dataArray.push(categoryItem))
                // We're only interested in processing objects here...no "else" 
                } else if (typeof dataItem === 'object' && dataItem !== null) {
                    // Look at every value of every key
                    for (let key in dataItem) {
                        const value = dataItem[key]

                        // If a string from the categories array found above is a key with its own
                        // array, then go through everything in that array. Otherwise put whatever
                        // the value variable is back in dataArray for the next while loop iteration.
                        if (categories.includes(key) && Array.isArray(value)) {
                            value.forEach(categoryItem => {
                                let isMatchFound = false

                                // This is to check for a match based on category name
                                // as opposed to values in the object
                                if (
                                    key.toLowerCase() === input ||
                                    pluralize.singular(key.toLowerCase()) === input ||
                                    pluralize.plural(key.toLowerCase()) === input
                                ) {
                                    isMatchFound = true
                                }

                                // Put the data in an array to be able to loop through it
                                const categoryItemsToProcess = [categoryItem]
                                
                                // This is the loop that finds results based on values in the objects
                                while (categoryItemsToProcess.length > 0 && !isMatchFound) {
                                    const currentCategoryItem = categoryItemsToProcess.pop()

                                    // The results sought are all objects...again no "else"
                                    if (typeof currentCategoryItem === 'object' && currentCategoryItem !== null) {
                                        // Look at every value of every key
                                        for (let categoryKey in currentCategoryItem) {
                                            const categoryValue = currentCategoryItem[categoryKey]

                                            // We're looking for text, so only strings and numbers matter
                                            // If the input is found in the text, then it's a match
                                            if (
                                                (typeof categoryValue === 'string' || typeof categoryValue === 'number') &&
                                                categoryValue.toString().toLowerCase().includes(input)
                                            ) {
                                                isMatchFound = true
                                                // No need to keep looking through this object if we know it's a result
                                                break
                                            }

                                            // If instead of text it's another object then
                                            // let the next inner while loop handle it
                                            if (typeof categoryValue === 'object' && categoryValue !== null) {
                                                categoryItemsToProcess.push(categoryValue)
                                            }
                                        }
                                    }
                                }

                                // For isMatchFound to be true, the categoryItem needs to have
                                // been determined to be an object that either has 1) a key
                                // that matches a category name and the singular/plural search
                                // input or 2) a value that contains the search input
                                if (isMatchFound) results.push(categoryItem)
                            })
                        } else {
                            // Anything else can be handled by the outside while loop
                            dataArray.push(value)
                        }
                    }
                }
            }

            // Make result tiles for the matches if there are any
            // and a 'Not found' tile if there aren't
            if (results.length > 0) {
                results.forEach(result => {
                    const newTile = createResultTile(result)
                    resultContainer.appendChild(newTile)
                })
            } else {
                const newTile = createResultTile('Not found')
                resultContainer.appendChild(newTile)
            }
        })
        .catch(error => {
            console.error('Error: ', error)
            const newTile = createResultTile('Error in fetch')
            resultContainer.appendChild(newTile)
        })
}

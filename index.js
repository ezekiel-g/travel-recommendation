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
            const dataArray = [data]

            while (dataArray.length > 0) {
                const dataItem = dataArray.pop()

                if (Array.isArray(dataItem)) {
                    dataItem.forEach(categoryItem => dataArray.push(categoryItem))
                } else if (typeof dataItem === 'object' && dataItem !== null) {
                    for (let key in dataItem) {
                        const value = dataItem[key]

                        if (categories.includes(key) && Array.isArray(value)) {
                            value.forEach(categoryItem => {
                                let isMatchFound = false

                                if (
                                    key.toLowerCase() === input ||
                                    pluralize.singular(key.toLowerCase()) === input ||
                                    pluralize.plural(key.toLowerCase()) === input
                                ) {
                                    isMatchFound = true
                                }

                                const categoryItemsToProcess = [categoryItem]

                                while (categoryItemsToProcess.length > 0 && !isMatchFound) {
                                    const currentCategoryItem = categoryItemsToProcess.pop()

                                    if (typeof currentCategoryItem === 'object' && currentCategoryItem !== null) {
                                        for (let categoryKey in currentCategoryItem) {
                                            const categoryValue = currentCategoryItem[categoryKey]

                                            if (
                                                (typeof categoryValue === 'string' || typeof categoryValue === 'number') &&
                                                categoryValue.toString().toLowerCase().includes(input)
                                            ) {
                                                isMatchFound = true
                                                break
                                            }

                                            if (typeof categoryValue === 'object' && categoryValue !== null) {
                                                categoryItemsToProcess.push(categoryValue)
                                            }
                                        }
                                    }
                                }

                                if (isMatchFound) results.push(categoryItem)
                            })
                        } else {
                            dataArray.push(value)
                        }
                    }
                }
            }

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

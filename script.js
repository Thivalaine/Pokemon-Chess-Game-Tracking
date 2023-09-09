const pokemonsList = document.querySelector('.pokemonSelect');
const slots = document.querySelectorAll('.pokemonSlot');
let slotIndex = 0;
let currentSlot = -1;
let selectedPokemonIndex = -1;
let playerOneDeck = [];
let playerTwoDeck = [];

// this function assign pokemon for each slot
function assignPokemonToSlot() {
    getPokemonsList().then(result => {
        const pokemonsImg = result.imgElements;
        const pokemonDatas = result.pokemonData;
        
        pokemonsImg.forEach((pokemonImg, index) => {
            pokemonImg.addEventListener('click', () => {
                if (slotIndex < slots.length && slots[slotIndex].classList.contains('focused')) {
                    const newImage = document.createElement('img');
                    newImage.src = pokemonImg.src; // Set the src attribute
                    slots[slotIndex].appendChild(newImage); //
                    slots[slotIndex].setAttribute('state', 'completed');
                    slotIndex++;

                    // save player 1 and player 2 deck for the party
                    if (slotIndex >= 1 && slotIndex <= 6) {
                        // playerOneDeck.push(pokemonDatas[index].name)
                        playerOneDeck.push({
                            index: slotIndex,
                            name: pokemonDatas[index].name,
                        });
                    } else if (slotIndex >= 7 && slotIndex <= 12) {
                        // playerTwoDeck.push(pokemonDatas[index].name);
                        playerTwoDeck.push({
                            index: slotIndex,
                            name: pokemonDatas[index].name,
                        });
                    }

                    // it's for focused next slot
                    if (slotIndex < slots.length && !slots[slotIndex].hasAttribute('state', 'completed')) {
                        slots[slotIndex - 1].classList.remove('focused');
                        slots[slotIndex].classList.add('focused');
                    } else {
                        // a revoir car il saute bien d'un cran quand il y a un slot deja rempli mais pas deux ni trois
                        slots[slotIndex - 1].classList.remove('focused');
                        slots[slotIndex + 1].classList.add('focused');
                    }
                } else {
                    // assign the current index to slot
                    currentSlot = index;
                }
            });
        });

        slots.forEach((slot, index) => {
            slot.addEventListener('click', () => {                
                // if currentSlot is not defined (pokemon never selected for this slot)
                if (currentSlot !== -1) {
                    const newImage = document.createElement('img');
                    const oldImage = slot.querySelector('img');

                    if (oldImage) {
                        slot.removeChild(oldImage);

                        // replace old Pokemon by new Pokemon and update deck array
                        if (index >= 0 && index <= 5) {
                            playerOneDeck[index] = {index: currentSlot, name: pokemonDatas[currentSlot].name};
                        } else if (index >= 6 && index <= 11) {
                            playerTwoDeck[index - 6] = {index: currentSlot, name: pokemonDatas[currentSlot].name};
                        }
                    }
                    newImage.src = pokemonsImg[currentSlot].src; // Set the src attribute
                    slot.appendChild(newImage); // Append the image to the slot
                    slot.setAttribute('state', 'completed');
                    // it's for clear currentSlot value (the value is keep and she was assigned to other slot not defined)
                    currentSlot = -1;
                } else {
                    // récupérer l'index du pokemon selectionner et ajouter a playerOneDeck et playerTwoDeck les pokemons inséres dans les slots
                }
            });
        });
    })
    .catch(error => {
        // Gérez l'erreur ici
        console.error('Erreur lors de la récupération des éléments img :', error);
    })
}

// this function set focused class to slot clicked
function getFocusedSlot() {
    slots.forEach(slot => {
        slot.addEventListener('click', () => {
            if (!hasFocusedSlot()) {
                slot.classList.add('focused');
            } else {
                slot.classList.remove('focused');
            }
        });
    });
}

// this verify if the slot is focused
function hasFocusedSlot() {
    for (let i = 0; i < slots.length; i++) {
        if (slots[i].classList.contains('focused')) {
            return true;
        }
    }
    return false;
}

function getPokemonsList() {
    return getPokemonsByJson().then(data => {
            const imgElements = [];
            const pokemonData = [];

            data.pokemons.forEach(pokemon => {
                const newPokemonSlot = document.createElement('button');
                const newPokemonImg = document.createElement('img');

                // assign Pokemon artwork to specific name (example Pikachu, get artwork of Pikachu)
                getPokemonsByApi(pokemon.name)
                    .then(data => {
                        newPokemonImg.src = data.image;
                        pokemonData.push({
                            name: pokemon.name,
                            image: data.image,
                        });
                    }).catch(error => {
                        console.error('Erreur lors de la récupération des données JSON :', error);
                        reject(error);  
                });
                newPokemonSlot.appendChild(newPokemonImg);

                pokemonsList.appendChild(newPokemonSlot);
                imgElements.push(newPokemonImg);
            });

            return {
                imgElements: imgElements,
                pokemonData: pokemonData,
            };
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données JSON :', error);
            reject(error);
        });
}

function getPokemonsByJson() {
    return fetch('pokemons.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du JSON');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Erreur lors de la récupération du JSON :', error);
            throw error; // Répétez l'erreur pour la gérer ailleurs si nécessaire
        });
}

// get datas from PokebuildAPI with Pokemon name
function getPokemonsByApi(name) {
    return fetch(`https://pokebuildapi.fr/api/v1/pokemon/${name}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération du JSON');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Erreur lors de la récupération du JSON :', error);
        throw error; // Répétez l'erreur pour la gérer ailleurs si nécessaire
    });
}

assignPokemonToSlot();
getFocusedSlot();
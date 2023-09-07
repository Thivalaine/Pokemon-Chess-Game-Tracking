const pokemonsList = document.querySelector('.pokemonSelect');
const slots = document.querySelectorAll('.pokemonSelected .pokemonSlot');
let slotIndex = 0;
let currentSlot = -1;

// this function assign pokemon for each slot
function assignPokemonToSlot() {
    getPokemonsList().then(pokemonsImg => {
        pokemonsImg.forEach((pokemonImg, index) => {
            pokemonImg.addEventListener('click', () => {
                if (slotIndex < slots.length && slots[slotIndex].classList.contains('focused')) {
                    const newImage = document.createElement('img');
                    newImage.src = pokemonImg.src; // Set the src attribute
                    slots[slotIndex].appendChild(newImage); //
                    slots[slotIndex].setAttribute('state', 'completed');
                    slotIndex++;

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

        slots.forEach(slot => {
            slot.addEventListener('click', () => {
                // if currentSlot is not defined (pokemon never selected for this slot)
                if (currentSlot !== -1) {
                    const newImage = document.createElement('img');
                    const oldImage = slot.querySelector('img');
                    
                    if (oldImage) {
                        slot.removeChild(oldImage);
                    }
                    newImage.src = pokemonsImg[currentSlot].src; // Set the src attribute
                    slot.appendChild(newImage); // Append the image to the slot
                    slot.setAttribute('state', 'completed');
                    // it's for clear currentSlot value (the value is keep and she was assigned to other slot not defined)
                    currentSlot = -1;
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
    return new Promise((resolve, reject) => {
        getPokemonsByJson()
            .then(data => {
                const imgElements = [];
                data.pokemons.forEach(pokemon => {
                    const newPokemonSlot = document.createElement('button');
                    const newPokemonImg = document.createElement('img');
                    
                    newPokemonImg.src = pokemon.artworkPictures;
                    newPokemonSlot.appendChild(newPokemonImg);

                    pokemonsList.appendChild(newPokemonSlot);
                    imgElements.push(newPokemonImg);
                });
                resolve(imgElements);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données JSON :', error);
                reject(error);
            });
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

assignPokemonToSlot();
getFocusedSlot();
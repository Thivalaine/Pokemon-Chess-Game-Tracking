const pokemonsList = document.querySelector('.pokemonSelect');
const pokemonsChoices = document.querySelector('.pokemonChoice');
const slots = document.querySelectorAll('.pokemonSlot');
let slotIndex = 0;
let currentSlot = -1;
let selectedPokemonIndex = -1;
let playerOneDeck = [];
let playerTwoDeck = [];
const pokemonsSubmit = document.querySelector('.pokemonSubmit');
const pokemonsPlayed = document.querySelector('.pokemonPlayed');
let gameStarted = false;
let turn = document.querySelector('.turn');
let turnCounter = 1;
const playerOne = document.querySelector('.playerOne');
const playerTwo = document.querySelector('.playerTwo');
const buttonNextTurn = document.querySelector('.nextTurn');
const buttonPreviousTurn = document.querySelector('.previousTurn');
const submitPlayerOneAction = document.querySelector('.submitPlayerOneAction');

// this function assign pokemon for each slot
function assignPokemonToSlot() {
    getPokemonsList().then(result => {
        const pokemonDatas = result.pokemonData;
        const pokemonsImages = createButtonAndImgFromPokemon(pokemonDatas);
        
        pokemonsImages.forEach((pokemonImg, index) => {
            pokemonImg.addEventListener('click', () => {
                if (slotIndex < slots.length && slots[slotIndex].classList.contains('focused')) {
                    const newImage = document.createElement('img');
                    newImage.src = pokemonImg.src; // Set the src attribute
                    slots[slotIndex].appendChild(newImage); //
                    slots[slotIndex].setAttribute('state', 'completed');
                    slotIndex++;

                    // save player 1 and player 2 deck for the party
                    if (slotIndex >= 1 && slotIndex <= 6) {
                        playerOneDeck.push({
                            index: slotIndex,
                            name: pokemonDatas[index].name,
                            skills: pokemonDatas[index].skills,
                            image: pokemonImg.src,
                        });
                    } else if (slotIndex >= 7 && slotIndex <= 12) {
                        // playerTwoDeck.push(pokemonDatas[index].name);
                        playerTwoDeck.push({
                            index: slotIndex,
                            name: pokemonDatas[index].name,
                            skills: pokemonDatas[index].skills,
                            image: pokemonImg.src,
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
                            playerOneDeck[index] = {
                                index: currentSlot, 
                                name: pokemonDatas[currentSlot].name,
                                skills: pokemonDatas[currentSlot].skills,
                                image: pokemonDatas[currentSlot].image,
                            };
                        } else if (index >= 6 && index <= 11) {
                            playerTwoDeck[index - 6] = {
                                index: currentSlot, 
                                name: pokemonDatas[currentSlot].name,
                                skills: pokemonDatas[currentSlot].skills,
                                image: pokemonDatas[currentSlot].image,
                            };
                        }
                    }
                    newImage.src = pokemonsImages[currentSlot].src; // Set the src attribute
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

function createButtonAndImgFromPokemon(pokemonsData = []) { // Renommez le paramètre
    const pokemonsImages = []; // Renommez la variable locale
    
    pokemonsData.forEach(pokemon => {
        const newPokemonSlot = document.createElement('button');
        const newPokemonImg = document.createElement('img');
        newPokemonImg.src = pokemon.image;

        // Ajouter l'image à l'interface utilisateur et stocker dans pokemonsImages
        pokemonsList.appendChild(newPokemonSlot);
        newPokemonSlot.appendChild(newPokemonImg);
        pokemonsImages.push(newPokemonImg);
    });

    return pokemonsImages;
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
    return getPokemonsByJson()
        .then(data => {
            const pokemonPromises = data.pokemons.map(pokemon => {
                return getPokemonsByApi(pokemon.name)
                    .then(data => {
                        const pokemonInfo = {
                            name: data.name,
                            image: data.image,
                            skills: pokemon.skills
                        };
                        return pokemonInfo;
                    })
                    .catch(error => {
                        console.error('Erreur lors de la récupération des données JSON :', error);
                        throw error;
                    });
            });

            return Promise.all(pokemonPromises)
                .then(pokemonData => {
                    return {
                        pokemonData: pokemonData,
                    };
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des données JSON :', error);
                    throw error;
                });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données JSON :', error);
            throw error;
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

function hasAttribute() {
    for (let i = 0; i < slots.length; i++) {
        if (!slots[i].hasAttribute('state', 'completed')) {
            return false;
        }
    }
    return true;
}

function startGame() {
    pokemonsSubmit.querySelector('button').addEventListener('click', () => {
        slots.forEach(slot => {
            if (hasAttribute()) {
                pokemonsList.remove();
                pokemonsChoices.remove();
                pokemonsSubmit.remove();
                pokemonsPlayed.style.display = "flex";
                localStorage.setItem(1, JSON.stringify([playerOneDeck]));
                localStorage.setItem(2, JSON.stringify(playerTwoDeck));
                gameStarted = true;
                inform();
            } else {
                console.log("Votre deck n'est pas fini !");
            }
        })
    })
}

function turnInit() {
    turn.innerText = turnCounter;
}

function nextTurn() {
    turnCounter = parseInt(turn.innerText) + 1
    turn.innerText = turnCounter;
}

function previousTurn() {
    turnCounter = parseInt(turn.innerText) - 1
    turn.innerText = turnCounter;
}

const skillElements = [];
const savedNextApproachable = {}; // Utiliser un objet au lieu d'un tableau

function inform() {
    // Initialisation des tableaux skillElements pour chaque Pokémon
    playerOneDeck.forEach((props, indexProp) => {
        const existingPokemonContainer = document.querySelector(`div[id="${indexProp + 1}"]`);
        const pokemonContainer = document.createElement('div');
        const newPictures = document.createElement('img');

        // ici on initialise si le skillElement n'existe pas
        if (!skillElements[indexProp]) {
            skillElements[indexProp] = [];
        }

        if (!existingPokemonContainer) {
            pokemonContainer.id = indexProp + 1;
            playerOne.appendChild(pokemonContainer);
            skillElements[indexProp] = [];

            newPictures.src = props['image'];
            pokemonContainer.appendChild(newPictures);
        }

        Object.keys(props['skills']).forEach((skill, index) => {
            const existingCheckbox = document.querySelector(`div[id="${indexProp + 1}"] input[value="${skill}"]`);
            const existingImg = document.querySelector(`div[id="${indexProp + 1}"] img`);
            const newCheckbox = document.createElement('input');
            const newLabel = document.createElement('label');

            if (!existingCheckbox) {
                newCheckbox.type = "checkbox";
                newCheckbox.value = skill;

                newLabel.innerText = skill;

                pokemonContainer.appendChild(newLabel);
                pokemonContainer.appendChild(newCheckbox);

                skillElements[indexProp].push(newCheckbox);
            }

            // Vérification des compétences ici
            const approachable = props['skills'][skill]['approachable'];
            const gap = props['skills'][skill]['gap'];
            const duration = props['skills'][skill]['duration'];
            const evolution = props['skills'][skill]['evolution'];

            const nextApproachable = (duration === 0 && gap === 0) ? 0 : turnCounter + duration + gap;
            
            // s'il n'existe pas de compétence sauvegardé
            if (!savedNextApproachable[skill]) {
                savedNextApproachable[skill] = [];
            }

            // ici on initialise un autre tableau par rapport à l'indexProp (index correspondant à un pokémon)
            if (!savedNextApproachable.hasOwnProperty(indexProp)) {
                savedNextApproachable[indexProp] = {}; // Initialiser l'objet si nécessaire
            }

            // Vérifier si la compétence existe dans savedNextApproachable
            if (!savedNextApproachable.hasOwnProperty(skill)) {
                savedNextApproachable[indexProp][skill] = []; // Initialiser le tableau si nécessaire
            }

            if (approachable >= turnCounter || (savedNextApproachable[indexProp][skill] && savedNextApproachable[indexProp][skill][0] > turnCounter)) {
                 // console.log(`Encore ${(approachable - turnCounter) + 1} tour(s) avant de pouvoir utiliser cette compétence !`);
                // Désactiver la compétence si elle n'est pas accessible
                skillElements[indexProp][index].disabled = true;

                // ici on retire l'image de l'évolution lorsque la duration de la compétence a été dépassée laissant juste le couldown bloquer la compétence
                if (evolution && savedNextApproachable[indexProp][skill]) {
                    const endOfDuration = savedNextApproachable[indexProp][skill][0];

                    if (turnCounter > (endOfDuration - gap) - 1) {
                        existingImg.src = props['image'];
                    }
                }
            } else {
                // Vérifier si la compétence a été utilisée
                if (skillElements[indexProp][index].checked) {
                    // on supprime les compétences précédemment stockées pour en placer de nouvelles
                    if (savedNextApproachable[indexProp][skill]) {
                        savedNextApproachable[indexProp][skill].shift();
                    }
                    // Réinitialiser la case à cocher et désactiver
                    skillElements[indexProp][index].checked = false;

                    // ici on désactive la compétence s'il y a un gap et un duration
                    if (nextApproachable > 0) {
                        skillElements[indexProp][index].disabled = true;
                    }
                    // console.log(`Compétence ${skill} utilisée, prochaine utilisation au tour ${nextApproachable}`);
                    
                    if (!savedNextApproachable[indexProp][skill]) {
                        savedNextApproachable[indexProp][skill] = [];
                    }
                    // a révoir car lien de l'image dans le pokemons.json pas ouf
                    if (evolution) {
                        existingImg.src = evolution;
                    }

                    savedNextApproachable[indexProp][skill].push(nextApproachable);
                } else {
                    // Activer la compétence
                    skillElements[indexProp][index].disabled = false;
                }
            }
        });
    });
}

function main() {
    assignPokemonToSlot();
    getFocusedSlot();
    startGame();
    turnInit();
}

main();
buttonNextTurn.addEventListener('click', () => {
    nextTurn();
})
buttonPreviousTurn.addEventListener('click', () => {
    previousTurn();
})

submitPlayerOneAction.addEventListener('click', () => {
    // on met le nextTurn() en premier car sinon lorsqu'une compétence est accessible au bout de 1 tour, elle est incrémentée avant et donc n'est pas respectée
    nextTurn();
    inform();
})

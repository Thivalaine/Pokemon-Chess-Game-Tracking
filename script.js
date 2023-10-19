const pokemonsList = document.querySelector('.pokemonSelect');
const pokemonsChoices = document.querySelector('.pokemonChoice');
const slots = document.querySelectorAll('.pokemonSlot');

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
const submitPlayersAction = document.querySelector('.submitPlayersAction');

function assignPokemonToSlot() {
    getPokemonsList().then(result => {
        const pokemonDatas = result.pokemonData;
        const pokemonsImages = createButtonAndImgFromPokemon(pokemonDatas);

        let selectedSlotIndex = 0;

        slots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                slots.forEach((s) => s.classList.remove('focused'));
                slot.classList.add('focused');
                
                selectedSlotIndex = index;
            });
        });

        pokemonsImages.forEach((pokemonImg, pokemonIndex) => {
            pokemonImg.addEventListener('click', () => {
                const slot = slots[selectedSlotIndex];
                const oldImage = slot.querySelector('img');
        
                if (slots[selectedSlotIndex].classList.contains('focused')) {
                    if (oldImage) {
                        oldImage.remove();
                    }
        
                    const newImage = document.createElement('img');
                    newImage.src = pokemonImg.src;
                    slot.appendChild(newImage);
                    slot.setAttribute('state', 'completed');
        
                    // playerOneDeck is for index between 0 and 5 and playerTwo is for index between 6 and 11
                    const playerDeck = (selectedSlotIndex >= 6 && selectedSlotIndex <= 11) ? playerTwoDeck : playerOneDeck;

                    playerDeck[selectedSlotIndex] = {
                        // on associe l'index courant du slot dans le tableau playerDeck
                        index: selectedSlotIndex,
                        name: pokemonDatas[pokemonIndex].name,
                        skills: pokemonDatas[pokemonIndex].skills,
                        image: pokemonDatas[pokemonIndex].image,
                        normalSkillDeck: pokemonDatas[pokemonIndex].normalSkillDeck
                    };
        
                    // select next slot when the current slot is completed
                    if (selectedSlotIndex < slots.length - 1) {
                        slots[selectedSlotIndex].classList.remove('focused');
                        selectedSlotIndex++;
                        slots[selectedSlotIndex].classList.add('focused');
                    }
                }
            });
        });
    })
    .catch(error => {
        // Gérez l'erreur ici
        console.error('Erreur lors de la récupération des éléments img :', error);
    });
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
                            skills: pokemon.skills,
                            normalSkillDeck: pokemon.normalSkillDeck
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

async function startGame() {
    pokemonsSubmit.querySelector('button').addEventListener('click', async () => {
        if (hasAttribute()) {
            pokemonsList.remove();
            pokemonsChoices.remove();
            pokemonsSubmit.remove();
            pokemonsPlayed.style.display = "flex";
            // localStorage.setItem(1, JSON.stringify([playerOneDeck]));
            // localStorage.setItem(2, JSON.stringify(playerTwoDeck));
            gameStarted = true;
            const promise1 = inform(playerOneDeck, playerOne);
            const promise2 = inform(playerTwoDeck, playerTwo);

            return await Promise.all([promise1, promise2]);

        } else {
            console.log("Votre deck n'est pas fini !");
        }
    })
}

function turnInit() {
    turn.innerText = turnCounter;
}

function nextTurn() {
    onlyOnePokemonDeckPlayed(playerOne);
    turnCounter = parseInt(turn.innerText) + 1
    turn.innerText = turnCounter;
}

function previousTurn() {
    turnCounter = parseInt(turn.innerText) - 1
    turn.innerText = turnCounter;
}

const skillElements = [];
const labelElements = [];
const savedNextApproachable = {}; // Utiliser un objet au lieu d'un tableau

function inform(playerDeck, playerContainer) {
    // Initialisation des tableaux skillElements pour chaque Pokémon
    return new Promise(resolve => {
        playerDeck.forEach((props, indexProp) => {
        const existingPokemonContainer = document.querySelector(`div[id="${indexProp + 1}"]`);
        const pokemonContainer = document.createElement('div');
        const newPictures = document.createElement('img');

        const allDeck = document.createElement('div');
        allDeck.classList.add('allDeck');

        const normalDeck = document.createElement('div');
        normalDeck.classList.add('normalDeck');

        // ici on initialise si le skillElement n'existe pas
        if (!skillElements[indexProp]) {
            skillElements[indexProp] = [];
        }

        if (!labelElements[indexProp]) {
            labelElements[indexProp] = [];
        }

        if (!existingPokemonContainer) {
            pokemonContainer.id = indexProp + 1;
            playerContainer.appendChild(pokemonContainer);
            skillElements[indexProp] = [];
            labelElements[indexProp] = [];

            newPictures.src = props['image'];
            pokemonContainer.appendChild(newPictures);
            pokemonContainer.appendChild(allDeck);
            allDeck.appendChild(normalDeck);
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

                normalDeck.appendChild(newLabel);
                normalDeck.appendChild(newCheckbox);

                skillElements[indexProp].push(newCheckbox);
                labelElements[indexProp].push(newLabel);

                if (index >= props['normalSkillDeck']) {
                    skillElements[indexProp][index].style.display = "none";
                    labelElements[indexProp][index].style.display = "none";
                }
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
                if (evolution && evolution.name && savedNextApproachable[indexProp][skill]) {
                    // savedNextApproachable contain nextApproachable variable and this contains duration, gap and turnCounter, delete gap from this to keep turnCounter and duration
                    const endOfDuration = savedNextApproachable[indexProp][skill][0] - gap;

                    if (turnCounter > endOfDuration - 1) {
                        Object.keys(skillElements[indexProp]).forEach((skillInProp) => {
                            if (skillInProp < props['normalSkillDeck']) {
                                skillElements[indexProp][skillInProp].style.display = "";
                                labelElements[indexProp][skillInProp].style.display = "";
                            } else {
                                skillElements[indexProp][skillInProp].style.display = "none";
                                labelElements[indexProp][skillInProp].style.display = "none";
                            }
                        })
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

                    if (evolution && evolution.name) {
                        Object.keys(skillElements[indexProp]).forEach((skillInProp) => {
                            if (skillInProp < props['normalSkillDeck']) {
                                skillElements[indexProp][skillInProp].style.display = "none";
                                labelElements[indexProp][skillInProp].style.display = "none";
                            } else {
                                skillElements[indexProp][skillInProp].style.display = "";
                                labelElements[indexProp][skillInProp].style.display = "";
                            }
                        })
                        getPokemonsByApi(evolution.name).then(data => {
                            return existingImg.src = data.image;
                        })
                        .catch(error => {
                            console.error('Erreur lors de la récupération des données JSON :', error);
                            throw error;
                        });
                    }

                    savedNextApproachable[indexProp][skill].push(nextApproachable);
                } else {
                    // Activer la compétence
                    skillElements[indexProp][index].disabled = false;
                }
            }
        });

        resolve();
    });
    })
}

function isPlayed(playerPlayContainer) {
    const playerInputs =  Array.from(playerPlayContainer.querySelectorAll('input'));
    const hasCheckedInput = playerInputs.some(playerInput => playerInput.checked);

    if (hasCheckedInput) {
        return true;
    } else {
        return false;
    }
}

function onlyOnePokemonDeckPlayed(playerPlayContainer) {
    const allPlayerInputs = playerPlayContainer.querySelectorAll('input');
    let firstInputParent = null;
    let canPlay = true;

    allPlayerInputs.forEach(playerInput => {
        if (playerInput.checked) {
            if (firstInputParent === null) {
                firstInputParent = playerInput.parentElement.parentElement.parentElement;
            } else if (playerInput.parentElement.parentElement.parentElement !== firstInputParent) {
                console.log('Vous ne pouvez pas jouer plusieurs Pokémon à la fois !');
                canPlay = false;
            }
        }
    });

    return canPlay;
}

function main() {
    assignPokemonToSlot();
    getFocusedSlot();
    startGame();
    turnInit();
}

main();

// buttonNextTurn.addEventListener('click', () => {
//     nextTurn();
// })
// buttonPreviousTurn.addEventListener('click', () => {
//     previousTurn();
// })

submitPlayersAction.addEventListener('click', () => {
    if (!isPlayed(playerOne) && !isPlayed(playerTwo)) {
        console.log("Les deux joueurs n'ont pas joué de compétence !");
    } else if (!isPlayed(playerOne)) {
        console.log("Le joueur 1 n'a pas joué de compétence !");
    } else if (!isPlayed(playerTwo)) {
        console.log("Le joueur 2 n'a pas joué de compétence !");
    } else {
        if (onlyOnePokemonDeckPlayed(playerOne) && onlyOnePokemonDeckPlayed(playerTwo)) {
            nextTurn();
            const promise1 = inform(playerOneDeck, playerOne);
            const promise2 = inform(playerTwoDeck, playerTwo);
    
            return Promise.all([promise1, promise2]).then(() => {
                // Traitement après la résolution des promesses
            });
        }    
    }
});

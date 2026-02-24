let selectedPlantCount = 0;
let loaded = !(localStorage.getItem("playtime") == null)
const board = JSON.parse(localStorage.getItem("board") ?? "[]")
const inventory = JSON.parse(localStorage.getItem("inventory") ?? `{"🌷": 0}`)
const itemInventory = JSON.parse(localStorage.getItem("itemInventory") ?? `{"🪏": 0, "⇪": 0}`)
let playtime = Number.parseInt(localStorage.getItem("playtime") ?? "0")
let xp = Number.parseInt(localStorage.getItem("xp") ?? "0")
let level = Number.parseInt(localStorage.getItem("level") ?? "0")
let tutorialStage = Number.parseInt(localStorage.getItem("tutorial") ?? "0")
let selectedTile;
let selectedPlant = 0;
let selectedItem = 0
let isInItemInventory = false
let tileLength;

console.log(`${new Date().getHours() >= 8 && new Date().getHours() <= 12}`)

for (let y = 0; y < 10; y++) {
    const row = document.createElement("div")
    let boardRow = [];
    row.style.display = 'flex';
    for (let x = 0; x < 10; x++) {
        const button = document.createElement("button")
        button.className = (x + y) & 1 === 1 ? "tile dark" : "tile light"
        let tile = {};
        if(loaded) {
            button.innerText = ''
            if(board[y][x].plant) {
                button.innerText = '🌱'
                if(board[y][x].plant.stage >= board[y][x].plant.maxStage) button.innerText = board[y][x].plant.type
            }
            tile = board[y][x]
            tile.ref = row.appendChild(button)
        } else {
            button.innerText = ''
            tile = {
                x,
                y,
                ref: row.appendChild(button)
            }
        }
        button.onclick = (event) => {
            if(tutorialStage == 4) try{document.getElementsByClassName("tutorial")[0].remove()} catch {}
            if(board[y][x].plant) {
                if(selectedTile) selectedTile.ref.classList.remove("selected")
                selectedTile = tile
                button.classList.add("selected")
                plantinfo.innerText = `Plant Type: ${board[y][x].plant.type}\nGrowth Stage: ${board[y][x].plant.stage}/${board[y][x].plant.maxStage}${board[y][x].plant.fertilized ? '\nFertilized!' : ''}`
            }
        }
        button.ondblclick = (event) => {
            if(board[y][x].plant) {
                if(board[y][x].plant.stage >= board[y][x].plant.maxStage) {
                    if(selectedTile) selectedTile.ref.classList.remove("selected")
                    if(board[y][x].plant.natural) {
                        plantXP = board[y][x].plant.stage * board[y][x].plant.multiplier
                        xp += plantXP
                        if(xp >= Math.pow(level + 1, 2) * 10) {
                            xp -= Math.pow(level + 1, 2) * 10
                            level++
                        }
                        xpdisplay.innerText = `Level ${level} (${xp}/${Math.pow(level + 1, 2) * 10} XP)`
                        
                        if(Math.random() * 200 < plantXP && level >= 5) {
                            if(tutorialStage == 6) {
                                const tutorial = document.createElement("div")
                                let inventoryX = document.getElementById("inventorydisplay").offsetLeft + document.getElementById("inventorydisplay").offsetWidth
                                let inventoryY = document.getElementById("inventorydisplay").offsetTop
                                tutorial.style.left = `${inventoryX + 10}`
                                tutorial.style.top = `${inventoryY}`
                                tutorial.style.width = `${tileLength * 4}`
                                tutorial.style.height = `${tileLength}`
                                tutorial.classList.add("tutorial")
                                tutorial.innerText = `← You got an item! Double-click your inventory to switch between plants and items.`
                                body.appendChild(tutorial)
                                tutorialStage++
                            }

                            if(Math.random() < 0.5) {
                                itemInventory['🪏']++
                            } else {
                                itemInventory['⇪']++
                            }
                            showInventory()
                        }
                    }

                    if(tutorialStage == 1) {
                        document.getElementsByClassName("tutorial")[0].remove()
                        const tutorial = document.createElement("div")
                        let inventoryX = document.getElementById("inventorydisplay").offsetLeft + document.getElementById("inventorydisplay").offsetWidth
                        let inventoryY = document.getElementById("inventorydisplay").offsetTop
                        tutorial.style.left = `${inventoryX + 10}`
                        tutorial.style.top = `${inventoryY}`
                        tutorial.style.width = `${tileLength * 4}`
                        tutorial.style.height = `${tileLength}`
                        tutorial.classList.add("tutorial")
                        tutorial.innerText = `← This is your inventory. It shows which plants you have unlocked. You can place the selected crop by double-clicking an empty tile.`
                        body.appendChild(tutorial)
                        tutorialStage++
                    }

                    if(tutorialStage == 4 && board[y][x].plant.type == '🌹') {
                        try{document.getElementsByClassName("tutorial")[0].remove()} catch {}
                        const tutorial = document.createElement("div")
                        let inventoryX = document.getElementById("inventorydisplay").offsetLeft + document.getElementById("inventorydisplay").offsetWidth
                        let inventoryY = document.getElementById("inventorydisplay").offsetTop
                        tutorial.style.left = `${inventoryX + 10}`
                        tutorial.style.top = `${inventoryY}`
                        tutorial.style.width = `${tileLength * 4}`
                        tutorial.style.height = `${tileLength}`
                        tutorial.classList.add("tutorial")
                        tutorial.innerText = `← Clicking the inventory button cycles through different plants. Right-Clicking also cycles backwards!`
                        body.appendChild(tutorial)
                        tutorialStage++
                    }
                
                    if(inventory[board[y][x].plant.type]) {
                        inventory[board[y][x].plant.type]++
                    } else inventory[board[y][x].plant.type] = 1
                    button.innerText = ''
                    delete board[y][x].plant
                    showInventory()
                } else if(isInItemInventory = true && selectedItem == 0 && selectedItemCount >= 1) {
                    if(tutorialStage == 8) {
                        try{document.getElementsByClassName("tutorial")[0].remove()} catch {}
                        tutorialStage++
                    }
                    delete board[y][x].plant
                    button.innerText = ''
                    itemInventory['🪏']--
                    showInventory()
                } else if(isInItemInventory = true && selectedItem == 1 && selectedItemCount >= 1 && !board[y][x].plant.fertilized) {
                    if(tutorialStage == 8) {
                        try{document.getElementsByClassName("tutorial")[0].remove()} catch {}
                        tutorialStage++
                    }
                    board[y][x].plant.fertilized = true
                    itemInventory['⇪']--
                    showInventory()
                }
            } else {
                if(selectedPlantCount >= 1) {
                    board[y][x].plant = {
                        natural: false,
                        type: `${getPlantByID(selectedPlant)}`,
                        stage: 0,
                        maxStage: 0
                    }
                    button.innerText = `${getPlantByID(selectedPlant)}`
                    inventory[getPlantByID(selectedPlant)]--
                    showInventory()
                }

                if(tutorialStage == 2) {
                    document.getElementsByClassName("tutorial")[0].remove()
                    const tutorial = document.createElement("div")
                    tutorial.style.left = `${tileLength * 10 + 10}`
                    tutorial.style.top = `${tileLength * 4.5}`
                    tutorial.style.width = `${tileLength * 4}`
                    tutorial.style.height = `${tileLength}`
                    tutorial.classList.add("tutorial")
                    tutorial.innerText = `Planting crops adjacent to an empty tile can grow new mutations. Try planting 4x 🌷 around a tile!`
                    body.appendChild(tutorial)
                    tutorialStage++
                }
            }
        }
        boardRow[x] = tile;
    }
    board[y] = boardRow;
    boardholder.appendChild(row)
}

tileLength = boardholder.offsetHeight / 10

function switchInventory() {
    if(tutorialStage == 7) {
        try{document.getElementsByClassName("tutorial")[0].remove()} catch {}
        const tutorial = document.createElement("div")
        let inventoryX = document.getElementById("inventorydisplay").offsetLeft + document.getElementById("inventorydisplay").offsetWidth
        let inventoryY = document.getElementById("inventorydisplay").offsetTop
        tutorial.style.left = `${inventoryX + 10}`
        tutorial.style.top = `${inventoryY}`
        tutorial.style.width = `${tileLength * 4.5}`
        tutorial.style.height = `${tileLength}`
        tutorial.classList.add("tutorial")
        tutorial.innerText = `← You can use items by double-clicking sprouts. Shovels remove sprouts and fertilizers speed up growth`
        body.appendChild(tutorial)
        tutorialStage++
    }
    if(level < 5) return;
    isInItemInventory = !isInItemInventory
    showInventory()
}

function nextPlant() {
    if(tutorialStage == 5) {
        tutorialStage++
        try{document.getElementsByClassName("tutorial")[0].remove()} catch {}
    }

    if(isInItemInventory) {
        selectedItem++;
        selectedItem = selectedItem % 2
        showInventory()
        return;
    }
    selectedPlant++;
    selectedPlant = selectedPlant % 43;
    while(!(inventory[getPlantByID(selectedPlant)] >= 0)) {
        selectedPlant++;
        selectedPlant = selectedPlant % 43;
    }
    showInventory()
}

function prevPlant() {
    if(tutorialStage == 5) {
        tutorialStage++
        try{document.getElementsByClassName("tutorial")[0].remove()} catch {}
    }

    if(isInItemInventory) {
        selectedItem++;
        selectedItem = selectedItem % 2
        showInventory()
        return;
    }
    selectedPlant--;
    if(selectedPlant < 0) selectedPlant = 43
    while(!(inventory[getPlantByID(selectedPlant)] >= 0)) {
        selectedPlant--;
        if(selectedPlant < 0) selectedPlant = 43
    }
    showInventory()
}

function showInventory() {
    if(isInItemInventory) {
        selectedItemCount = itemInventory[getItemByID(selectedItem)]
        inventorydisplay.innerText = `${selectedItemCount}x ${getItemByID(selectedItem)}`
    } else {
        selectedPlantCount = inventory[getPlantByID(selectedPlant)]
        inventorydisplay.innerText = `${selectedPlantCount}x ${getPlantByID(selectedPlant)}`
    }
}

function getPlantByID(id) {
    switch(id) {
        case 0: {
            return '🌷'
        }
        case 1: {
            return '🌹';
        }
        case 2: {
            return '🌺';
        }
        case 3: {
            return '🥀';
        }
        case 4: {
            return '🌿';
        }
        case 5: {
            return '☘️';
        }
        case 6: {
            return '🍀';
        }
        case 7: {
            return '🌸';
        }
        case 8: {
            return '🍒';
        }
        case 9: {
            return '🥦';
        }
        case 10: {
            return '🥬';
        }
        case 11: {
            return '🍎';
        }
        case 12: {
            return '🍏';
        }
        case 13: {
            return '🌲';
        }
        case 14: {
            return '🍍';
        }
        case 15: {
            return '🍅';
        }
        case 16: {
            return '🥭';
        }
        case 17: {
            return '🍑';
        }
        case 18: {
            return '🍊';
        }
        case 19: {
            return '🍇';
        }
        case 20: {
            return '🪷';
        }
        case 21: {
            return '🪻';
        }
        case 22: {
            return '🫐';
        }
        case 23: {
            return '🌶️';
        }
        case 24: {
            return '🍋';
        }
        case 25: {
            return '🌳';
        }
        case 26: {
            return '🌴';
        }
        case 27: {
            return '🍌';
        }
        case 28: {
            return '🍐';
        }
        case 29: {
            return '🍓';
        }
        case 30: {
            return '🍈';
        }
        case 31: {
            return '🍉';
        }
        case 32: {
            return '🌻';
        }
        case 33: {
            return '🍄';
        }
        case 34: {
            return '🌾';
        }
        case 35: {
            return '🌽';
        }
        case 36: {
            return '🥑';
        }
        case 37: {
            return '🥒';
        }
        case 38: {
            return '🫑';
        }
        case 39: {
            return '🍋‍🟩';
        }
        case 40: {
            return '🍆';
        }
        case 41: {
            return '🥔';
        }
        case 42: {
            return '🥕';
        }
    }
}

function getItemByID(id) {
    switch(id) {
        case 0: {
            return '🪏';
        }
        case 1: {
            return '⇪';
        }
    }
}

function tick() {
        
    const tile = board[Math.floor(Math.random() * 10)][Math.floor(Math.random() * 10)]
    const x = tile.x
    const y = tile.y
    const ref = tile.ref

    if(board[y][x].plant) {
        board[y][x].plant.stage++
        if(board[y][x].plant.fertilized && board[y][x].plant.stage < board[y][x].plant.maxStage) board[y][x].plant.stage++
        if(board[y][x].plant.stage >= board[y][x].plant.maxStage) {
            ref.innerText = board[y][x].plant.type
            if(tutorialStage == 0) {
                const tutorial = document.createElement("div")
                tutorial.style.left = `${tileLength * (x + 1)}`
                tutorial.style.top = `${tileLength * y}`
                tutorial.style.width = `${tileLength * 2}`
                tutorial.style.height = `${tileLength}`
                tutorial.classList.add("tutorial")
                tutorial.innerText = `← Harvest your crops by double-clicking on them`
                body.appendChild(tutorial)
                tutorialStage++
            }
        }
        if(board[y][x].plant.stage > board[y][x].plant.maxStage) board[y][x].plant.stage--
    } else {
        let totalPlants = 0
        const adjacentPlants = {}

        for(let x1 = x - 1; x1 <= x + 1; x1++) {
            for(let y1 = y - 1; y1 <= y + 1; y1++) {
                if(x == x1 && y == y1) continue;
                if(!board[y1]) continue;
                if(!board[y1][x1]) continue;
                if(!board[y1][x1].plant) continue;
                totalPlants++
                if(board[y1][x1].plant.stage >= board[y1][x1].plant.maxStage) {
                    if(adjacentPlants[board[y1][x1].plant.type]) {
                        adjacentPlants[board[y1][x1].plant.type]++
                    } else adjacentPlants[board[y1][x1].plant.type] = 1
                } else {
                    if(adjacentPlants.sprout) {
                        adjacentPlants.sprout++
                    } else adjacentPlants.sprout = 1
                }
            }  
        }

        if(totalPlants == 0) {
            board[y][x].plant = {
                type: '🌷',
                stage: 0,
                maxStage: 3,
                natural: true,
                multiplier: 1
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants.sprout == 4 && adjacentPlants['🌷'] == 4 && Math.random() < 0.3) {
            board[y][x].plant = {
                type: '🥀',
                stage: 0,
                maxStage: 8,
                natural: true,
                multiplier: 3
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌷'] >= 4 && Math.random() < 0.4) {
            board[y][x].plant = {
                type: '🌹',
                stage: 0,
                maxStage: 5,
                natural: true,
                multiplier: 1
            }
            ref.innerText = '🌱'

            if(tutorialStage == 3) {
                document.getElementsByClassName("tutorial")[0].remove()
                const tutorial = document.createElement("div")
                tutorial.style.left = `${tileLength * (x + 1)}`
                tutorial.style.top = `${tileLength * y}`
                tutorial.style.width = `${tileLength * 2.5}`
                tutorial.style.height = `${tileLength}`
                tutorial.classList.add("tutorial")
                tutorial.innerText = `← You can inspect your mutation by clicking on it. The info is displayed below the board.`
                body.appendChild(tutorial)
                tutorialStage++
            }
        } else if(adjacentPlants['🌹'] == 8 && Math.random() < 0.5) {
            board[y][x].plant = {
                type: '🌺',
                stage: 0,
                maxStage: 5,
                natural: true,
                multiplier: 1.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants.sprout >= 4 && Math.random() < 0.25) {
            board[y][x].plant = {
                type: '🌿',
                stage: 0,
                maxStage: 3,
                natural: true,
                multiplier: 2.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌿'] == 8 && Math.random() < 0.01) {
            board[y][x].plant = {
                type: '🍀',
                stage: 0,
                maxStage: 25,
                natural: true,
                multiplier: 10
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌿'] == 8 && Math.random() < 0.495) {
            board[y][x].plant = {
                type: '☘️',
                stage: 0,
                maxStage: 8,
                natural: true,
                multiplier: 1.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🥀'] >= 2 && adjacentPlants['🌺'] >= 2 && adjacentPlants['☘️'] >= 2 && Math.random() < 0.2) {
            board[y][x].plant = {
                type: '🌸',
                stage: 0,
                maxStage: 8,
                natural: true,
                multiplier: 2
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌸'] >= 4 && adjacentPlants['🥦'] >= 4 && Math.random() < 0.4) {
            board[y][x].plant = {
                type: '🍏',
                stage: 0,
                maxStage: 15,
                natural: true,
                multiplier: 2
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌸'] >= 4 && Math.random() < 0.2) {
            board[y][x].plant = {
                type: '🍒',
                stage: 0,
                maxStage: 8,
                natural: true,
                multiplier: 2
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['☘️'] >= 8 && Math.random() < 0.1) {
            board[y][x].plant = {
                type: '🥦',
                stage: 0,
                maxStage: 15,
                natural: true,
                multiplier: 2
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🥦'] >= 1 && Math.random() < 0.25) {
            board[y][x].plant = {
                type: '🥬',
                stage: 0,
                maxStage: 15,
                natural: true,
                multiplier: 0.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌸'] >= 4 && adjacentPlants['🍒'] >= 4 && Math.random() < 0.2) {
            board[y][x].plant = {
                type: '🍎',
                stage: 0,
                maxStage: 15,
                natural: true,
                multiplier: 2
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌿'] >= 3 && adjacentPlants['🥬'] >= 3 && Math.random() < 0.1) {
            board[y][x].plant = {
                type: '🌲',
                stage: 0,
                maxStage: 15,
                natural: true,
                multiplier: 1.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌲'] >= 2 && adjacentPlants['🍏'] >= 2 && adjacentPlants['🍎'] >= 2 && Math.random() < 0.05) {
            board[y][x].plant = {
                type: '🍍',
                stage: 0,
                maxStage: 25,
                natural: true,
                multiplier: 2.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌿'] >= 4 && adjacentPlants['🍒'] >= 4 && Math.random() < 0.4) {
            board[y][x].plant = {
                type: '🍅',
                stage: 0,
                maxStage: 8,
                natural: true,
                multiplier: 1.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🍍'] >= 2 && adjacentPlants['🍏'] >= 2 && Math.random() < 0.15) {
            board[y][x].plant = {
                type: '🥭',
                stage: 0,
                maxStage: 15,
                natural: true,
                multiplier: 2.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🍎'] >= 3 && adjacentPlants['🍏'] >= 3 && Math.random() < 0.15) {
            board[y][x].plant = {
                type: '🍑',
                stage: 0,
                maxStage: 15,
                natural: true,
                multiplier: 2
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🍑'] >= 4 && adjacentPlants['🥭'] >= 2 && Math.random() < 0.15) {
            board[y][x].plant = {
                type: '🍊',
                stage: 0,
                maxStage: 25,
                natural: true,
                multiplier: 2
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🥭'] >= 3 && adjacentPlants['🍒'] >= 3 && Math.random() < 0.2) {
            board[y][x].plant = {
                type: '🍇',
                stage: 0,
                maxStage: 25,
                natural: true,
                multiplier: 2
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🍀'] >= 1 && adjacentPlants['🥀'] >= 4 && Math.random() < 0.2) {
            board[y][x].plant = {
                type: '🪷',
                stage: 0,
                maxStage: 15,
                natural: true,
                multiplier: 2
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🪷'] >= 4 && Math.random() < 0.2) {
            board[y][x].plant = {
                type: '🪻',
                stage: 0,
                maxStage: 15,
                natural: true,
                multiplier: 1.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🪻'] >= 4 && adjacentPlants['🍒'] >= 4 && Math.random() < 0.2) {
            board[y][x].plant = {
                type: '🫐',
                stage: 0,
                maxStage: 25,
                natural: true,
                multiplier: 2
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🫐'] >= 3 && adjacentPlants['🍒'] >= 3 && Math.random() < 0.2) {
            board[y][x].plant = {
                type: '🍇',
                stage: 0,
                maxStage: 25,
                natural: true,
                multiplier: 2
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🍅'] >= 3 && Math.random() < 0.2) {
            board[y][x].plant = {
                type: '🌶️',
                stage: 0,
                maxStage: 25,
                natural: true,
                multiplier: 2
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🍊'] >= 4 && Math.random() < 0.1) {
            board[y][x].plant = {
                type: '🍋',
                stage: 0,
                maxStage: 25,
                natural: true,
                multiplier: 2
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌿'] >= 2 && adjacentPlants['🌲'] >= 2 && adjacentPlants.sprout >= 4 && Math.random() < 0.1) {
            board[y][x].plant = {
                type: '🌳',
                stage: 0,
                maxStage: 40,
                natural: true,
                multiplier: 2.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌳'] >= 2 && adjacentPlants['🍋'] >= 2 && adjacentPlants['🍊'] >= 2 && Math.random() < 0.05) {
            board[y][x].plant = {
                type: '🌴',
                stage: 0,
                maxStage: 25,
                natural: true,
                multiplier: 2.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌴'] >= 3 && adjacentPlants.sprout >= 3 && Math.random() < 0.1) {
            board[y][x].plant = {
                type: '🍌',
                stage: 0,
                maxStage: 25,
                natural: true,
                multiplier: 2
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🍌'] >= 4 && adjacentPlants['🍏'] >= 4 && Math.random() < 0.1) {
            board[y][x].plant = {
                type: '🍐',
                stage: 0,
                maxStage: 25,
                natural: true,
                multiplier: 2
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🍇'] >= 2 && adjacentPlants.sprout >= 4 && Math.random() < 0.05) {
            board[y][x].plant = {
                type: '🍓',
                stage: 0,
                maxStage: 25,
                natural: true,
                multiplier: 2.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🪻'] >= 2 && adjacentPlants['🍋'] >= 4 && Math.random() < 0.05) {
            board[y][x].plant = {
                type: '🍈',
                stage: 0,
                maxStage: 25,
                natural: true,
                multiplier: 2.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🍈'] >= 4 && adjacentPlants['🍓'] >= 4 && Math.random() < 0.05) {
            board[y][x].plant = {
                type: '🍉',
                stage: 0,
                maxStage: 40,
                natural: true,
                multiplier: 2.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌺'] >= 8 && Math.random() < 0.05 && new Date().getHours() >= 8 && new Date().getHours() <= 12) {
            board[y][x].plant = {
                type: '🌻',
                stage: 0,
                maxStage: 25,
                natural: true,
                multiplier: 3
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🪷'] >= 8 && Math.random() < 0.02 && (new Date().getHours() < 6 || new Date().getHours() >= 22)) {
            board[y][x].plant = {
                type: '🍄',
                stage: 0,
                maxStage: 40,
                natural: true,
                multiplier: 3
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌻'] >= 2 && adjacentPlants['🌿'] >= 2 && adjacentPlants['☘️'] >= 2 && adjacentPlants['🌳'] >= 2 && Math.random() < 0.05) {
            board[y][x].plant = {
                type: '🌾',
                stage: 0,
                maxStage: 40,
                natural: true,
                multiplier: 2.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌾'] >= 8 && Math.random() < 0.02) {
            board[y][x].plant = {
                type: '🌽',
                stage: 0,
                maxStage: 40,
                natural: true,
                multiplier: 2.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌽'] >= 2 && adjacentPlants['🍐'] >= 2 && Math.random() < 0.02) {
            board[y][x].plant = {
                type: '🥑',
                stage: 0,
                maxStage: 40,
                natural: true,
                multiplier: 2.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🥑'] >= 2 && adjacentPlants['🌿'] >= 4 && adjacentPlants.sprout >= 2 && Math.random() < 0.02) {
            board[y][x].plant = {
                type: '🥒',
                stage: 0,
                maxStage: 65,
                natural: true,
                multiplier: 3
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌶️'] >= 2 && adjacentPlants['🥒'] >= 2 && Math.random() < 0.02) {
            board[y][x].plant = {
                type: '🫑',
                stage: 0,
                maxStage: 65,
                natural: true,
                multiplier: 2.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🥑'] >= 2 && adjacentPlants['🍋'] >= 2 && Math.random() < 0.02) {
            board[y][x].plant = {
                type: '🍋‍🟩',
                stage: 0,
                maxStage: 40,
                natural: true,
                multiplier: 2.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🥒'] >= 2 && adjacentPlants['🪻'] >= 2 && adjacentPlants['🍄'] >= 2 && Math.random() < 0.02) {
            board[y][x].plant = {
                type: '🍆',
                stage: 0,
                maxStage: 65,
                natural: true,
                multiplier: 2.5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🍉'] >= 2 && adjacentPlants['🥑'] >= 2 && adjacentPlants['🫑'] >= 2 && Math.random() < 0.02) {
            board[y][x].plant = {
                type: '🥔',
                stage: 0,
                maxStage: 65,
                natural: true,
                multiplier: 3
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🥔'] >= 3 && adjacentPlants['🍆'] >= 2 && adjacentPlants.sprout >= 3 && Math.random() < 0.02) {
            board[y][x].plant = {
                type: '🥕',
                stage: 0,
                maxStage: 65,
                natural: true,
                multiplier: 3
            }
            ref.innerText = '🌱'
        }

        if(level < 20) return;

        for(let x1 = x - 2; x1 <= x + 2; x1++) {
            for(let y1 = y - 2; y1 <= y + 2; y1++) {
                if(x == x1 && y == y1) continue;
                if(!board[y1]) continue;
                if(!board[y1][x1]) continue;
                if(!board[y1][x1].plant) continue;
                if(Math.abs(x1 - x) <= 1 && Math.abs(y1 - y) <= 1) continue;
                if(Math.abs(x1 - x) == 2 && Math.abs(y1 - y) == 2) continue;
                totalPlants++
                if(board[y1][x1].plant.stage >= board[y1][x1].plant.maxStage) {
                    if(adjacentPlants[board[y1][x1].plant.type]) {
                        adjacentPlants[board[y1][x1].plant.type]++
                    } else adjacentPlants[board[y1][x1].plant.type] = 1
                } else {
                    if(adjacentPlants.sprout) {
                        adjacentPlants.sprout++
                    } else adjacentPlants.sprout = 1
                }
            }  
        }

        if(adjacentPlants.sprout == 20 && Math.random() < 0.01) {
            board[y][x].plant = {
                type: '🌵',
                stage: 0,
                maxStage: 65,
                natural: true,
                multiplier: 5
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌴'] >= 12 && adjacentPlants['🍈'] >= 8 && Math.random() < 0.01) {
            board[y][x].plant = {
                type: '🥥',
                stage: 0,
                maxStage: 65,
                natural: true,
                multiplier: 4
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🥕'] >= 16 && adjacentPlants['🥥'] >= 4 && Math.random() < 0.01) {
            board[y][x].plant = {
                type: '🧄',
                stage: 0,
                maxStage: 65,
                natural: true,
                multiplier: 4
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🧄'] >= 8 && adjacentPlants['🍋'] >= 12 && Math.random() < 0.01) {
            board[y][x].plant = {
                type: '🧅',
                stage: 0,
                maxStage: 65,
                natural: true,
                multiplier: 4
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🍋‍🟩'] >= 8 && adjacentPlants['🌵'] >= 8 && adjacentPlants['🥥'] >= 4 && Math.random() < 0.01) {
            board[y][x].plant = {
                type: '🥝',
                stage: 0,
                maxStage: 65,
                natural: true,
                multiplier: 4
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🧅'] >= 4 && adjacentPlants['🥝'] >= 12 && adjacentPlants['🍀'] >= 4 && Math.random() < 0.01) {
            board[y][x].plant = {
                type: '🫒',
                stage: 0,
                maxStage: 65,
                natural: true,
                multiplier: 4
            }
            ref.innerText = '🌱'
        } else if(adjacentPlants['🌷'] >= 2 && adjacentPlants['🌹'] >= 2 && adjacentPlants['🌺'] >= 2 && adjacentPlants['🥀'] >= 2 && adjacentPlants['🌸'] >= 2 && adjacentPlants['🪷'] >= 2 && adjacentPlants['🪻'] >= 2 && adjacentPlants['🌻'] >= 2 && Math.random() < 0.01) {
            board[y][x].plant = {
                type: '💐',
                stage: 0,
                maxStage: 100,
                natural: true,
                multiplier: 3
            }
            ref.innerText = '🌱'
        }
    }
}

setInterval(() => {

    playtime++
    playtimedisplay.innerText = `Playtime: ${Math.floor(playtime / 3600).toString().padStart(2, "0")}:${Math.floor((playtime % 3600) / 60).toString().padStart(2, "0")}:${(playtime % 60).toString().padStart(2, "0")}`
    let amount = Number.parseInt(localStorage.getItem("lastTime") ?? Math.floor(Date.now() / 1000) - 1) - Math.floor(Date.now() / 1000)
    amount *= -1
    amount = Math.max(amount, 1)
    for(let i = 0; i < Math.min(amount, 3600); i++) {
        tick()
    }

    localStorage.setItem("xp", `${xp}`)
    localStorage.setItem("level", `${level}`)
    localStorage.setItem("playtime", `${playtime}`)
    localStorage.setItem("board", JSON.stringify(board))
    localStorage.setItem("inventory", JSON.stringify(inventory))
    localStorage.setItem("itemInventory", JSON.stringify(itemInventory))
    localStorage.setItem("tutorial", `${tutorialStage}`)
    localStorage.setItem("lastTime", Math.floor(Date.now() / 1000))
}, 1000)

showInventory()

window.addEventListener("contextmenu", (event) => {
    event.preventDefault()
})

let amount = Number.parseInt(localStorage.getItem("lastTime") ?? Math.floor(Date.now() / 1000) - 1) - Math.floor(Date.now() / 1000)
amount *= -1
amount = Math.max(amount, 1)
for(let i = 0; i < Math.min(amount, 3600); i++) {
    tick()
}
localStorage.setItem("lastTime", Math.floor(Date.now() / 1000))

// 💮🏵️🌼 🪴
// 
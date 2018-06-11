'use strict';

let verbose = true;

/**
 * Shorthand function for querySelector
 * @param {String} css selector
 * @param {Bool} returnArray force the function to return an array
 * @return {NodeElement} / {NodeElementList} depending on query returning multiple elements
 */
const $ = function(query, returnArray = false) {
    let result = document.querySelectorAll(query);
    if (result.length > 1 || returnArray) {
        return result;
    } else if (result) {
        return result[0];
    }
    return undefined;
}

/**
 * Creates a new [tag] element and assigns the provided attributes to it
 * @param  {String} tag name
 * @param  {Object} attributes object to be applied
 * @param  {Object} style style to be applied to the object
 * @return {NodeElement} the new element
 */
function newEl(tag, attr = {}, style = {}) {
    let el = document.createElement(tag);
    Object.assign(el, attr);
    Object.assign(el.style, style)
    return el;
}

/**
 * Get the parameter value from an url string
 * @param  {Location} location object
 * @param  {String} parameter to search for
 * @return {String} parameter value or undefined if not found
 */
function getParameterValue(param, path) {
    path = !!path ? path : location.pathname;
    let parts = escape(path).split('/');
    for (let i = 0; i < parts.length; i++) {
        if (parts[i] == param && parts.length > i) {
            return parts[i + 1];
        }
    }
    return undefined;
}

/**
 * make a fetch call to the server
 * @param  {String}   fetchURL      fetch URL
 * @param  {Object}   options  fetch options
 * @param  {Function} callback
 */
async function callServer(fetchURL, options, callback) {
    const fetchOptions = {
        credentials: 'same-origin',
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    };

    Object.assign(fetchOptions, options);

    if (verbose) console.log("requesting: " + fetchOptions.method.toUpperCase() + ' ' + fetchURL, fetchOptions);
    const response = await fetch(fetchURL, fetchOptions);
    if (!response.ok) {
        console.log("Server error:\n" + response.status);
        callback(response.status);
    } else {
        let data = await response.json();
        if (!data) {
            data = JSON.stringify({
                err: "error on fetch"
            });
        }

        if (verbose) console.log("recieved: ", data);
        callback(null, data);
    }
}

/**
 * toggles the verbose state
 */
function toggleVerbose() {
    if (localStorage.verbose == 'false') {
        verbose = true;
        localStorage.verbose = true;
        console.log("Verbose mode enabled.");
    } else {
        verbose = false;
        localStorage.verbose = false;
        console.log("Verbose mode disabled. Enjoy the silence :)");
    }
}

function createPlayer(player) {
    let container = newEl('div', {
        classList: 'player'
    })
    container.dataset.name = player.name.toLowerCase();

    let spec = newEl('div', {
        classList: 'spec'
    })
    spec.append(newEl('img', {
        src: getSpecIcon(player.class, player.spec.id)
    }))
    spec.append(newEl('span', {
        classList: 'ilvl',
        textContent: player.spec.ilvl 
    }))
    container.append(spec);

    container.append(newEl('div', {
        classList: 'name',
        textContent: player.name,
        style: 'color: ' + classes[player.class].colour
    }))

    let deleteButton = newEl('div', {
        classList: 'delete'
    })
    deleteButton.append(newEl('i', {
        classList: 'glyphicon glyphicon-remove'
    }))
    deleteButton.dataset.name = player.name.toLowerCase();
    deleteButton.addEventListener('click', removePlayer);
    container.append(deleteButton)

    return container;
}

function getSpecIcon(classname, specid) {
    return 'https://render-eu.worldofwarcraft.com/icons/18/' + 
                classes[classname].specs[specid].icon + '.jpg';
}

function removePlayer(e) {
    let player = e.currentTarget.dataset.name;
    let name = player.charAt(0).toUpperCase() + player.slice(1);
    if(window.confirm(`Are you sure you want to delete the player ${name}?`)) {
        callServer('/api/raider/' + player, {
            method: 'delete'
        }, function(err, data) {
            loadRaiders(data);
        })
    }
}

function appendPlayers(players, container) {
    players.forEach(function(p) {
        container.append(createPlayer(p));
    })
}

function loadRaiders(raiders) {
    clearTable();
    let roles = {
        tanks: [],
        healers: [],
        dps: {
            ranged: [],
            melee: []
        }
    }

    raiders.forEach(function(raider) {
        let spec = classes[raider.class].specs[raider.spec.id];

        if(spec) {
            // tank
            if(spec.role == 'tank') {
                roles.tanks.push(raider);
            }
            // healer
            else if(spec.role == 'heal') {
                roles.healers.push(raider);
            }
            // dps
            else if(spec.role == 'dps') {
                // ranged
                if(spec.range == 'ranged') {
                    roles.dps.ranged.push(raider);
                }
                else if(spec.range == 'melee') {
                    roles.dps.melee.push(raider);
                }
                // no/wrong range
                else if(verbose) console.log("Error when parsing player (range)", raider);
            }
            // no/wrong spec
            else if(verbose) console.log("Error when parsing player (spec)", raider);
        }
        // no/wrong class or spec
        else if(verbose) console.log("Error when parsing player (class/spec)", raider);
    })

    $('.total h3').textContent = 'Total: ' + 
        (roles.tanks.length + roles.healers.length + roles.dps.ranged.length + roles.dps.melee.length);
    $('.tanks h3').textContent = 'Tanks: ' + roles.tanks.length;
    $('.healers h3').textContent = 'Healers: ' + roles.healers.length;
    $('.dps h3').textContent = 'DPS: ' + (roles.dps.ranged.length + roles.dps.melee.length);
    $('.ranged h3').textContent = 'Ranged: ' + roles.dps.ranged.length;
    $('.melee h3').textContent = 'Melee: ' + roles.dps.melee.length;

    roles.tanks.sort(compareIlvls);
    appendPlayers(roles.tanks, $('.tanks'));

    roles.healers.sort(compareIlvls);
    appendPlayers(roles.healers, $('.healers'));

    roles.dps.ranged.sort(compareIlvls);
    appendPlayers(roles.dps.ranged, $('.ranged'));

    roles.dps.melee.sort(compareIlvls);
    appendPlayers(roles.dps.melee, $('.melee'));
}

function compareIlvls(a, b) {
    if(a.spec.ilvl > b.spec.ilvl) return -1;
    if(a.spec.ilvl < b.spec.ilvl) return 1;
    return 0;
}

function clearTable() {
    $('.tanks div', true).forEach(function(item){item.remove()});
    $('.healers div', true).forEach(function(item){item.remove()});
    $('.ranged div', true).forEach(function(item){item.remove()});
    $('.melee div', true).forEach(function(item){item.remove()});
}

function addPlayer() {
    let player = {
        name: $('#playerName').value,
        class: $('#playerClass').value,
        spec: {
            id: $('#playerSpec').value,
            ilvl: $('#playerIlvl').value,
        }
    }

    if(player.name && player.class && player.spec.id && player.spec.ilvl) {
        $('#playerName').value = $('#playerIlvl').value = '';
        callServer('/api/raiders', {
            method: 'post',
            body: JSON.stringify(player)
        }, function(err, data) {
            loadRaiders(data);
        })
    }
}

function showMassAdd() {
    $('.massadd').style.display = 'block';
}

function closeMassAdd() {
    $('.massadd').style.display = 'none';
}

function massAdd() {
    // get mass add text and split lines
    let text = $('.massadd textarea').value;
    let lines = text.split('\n');
    let players = [];

    lines.forEach(function(line) {
        // remove whitespaces
        line = line.toLowerCase().trim();

        // if not a comment
        if(line.charAt(0) !== '#') {
            // capitalize character name
            line = line.charAt(0).toUpperCase() + line.slice(1);
            // split stats
            let stats = line.split(';');

            if(stats.length === 4) {
                // remove inner whitespaces
                stats.forEach(function(part) {part.trim()});

                let specid = 0;

                if(isNaN(parseInt(stats[2]))) {
                    for(let i = 0; i < classes[stats[1]].specs.length; i++) {
                        if(classes[stats[1]].specs[i].name.toLowerCase() == stats[2]) {
                            specid = i;
                            break;
                        }
                    }
                }
                else {
                    specid = stats[2];
                }

                players.push({
                    name: stats[0],
                    class: stats[1],
                    spec: {
                        id: specid,
                        ilvl: stats[3]
                    }
                })
            }
        }
    })
    closeMassAdd();
    callServer('/api/raiders', {
        method: 'post',
        body: JSON.stringify(players)
    }, function(err, data) {
        loadRaiders(data);
    })
}
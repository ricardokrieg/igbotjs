const express = require('express')
const { createWriteStream, readFileSync } = require('fs');
const { compact } = require('lodash')

const app = express()
const port = 3000

const file = `blacklist.txt`
const stream = createWriteStream(file, { flags: 'a' });
const blacklist = compact(readFileSync(file, `utf8`).split("\n"));

console.log(`Starting Blacklist with ${blacklist.length} items:`)
console.log(blacklist)

app.get('/source', (req, res) => {
    res.json({ source: `locutorwillianlima` })
})

app.get('/target/:target', (req, res) => {
    const target = req.params.target
    const blacklisted = blacklist.includes(target)

    if (!blacklisted) {
        blacklist.push(target)
        stream.write(`${target}\n`);

        console.log(`Blacklist (${blacklist.length} items):`)
        console.log(blacklist)
    }

    res.json({ blacklisted })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

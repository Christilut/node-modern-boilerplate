const Liana = require('forest-express-mongoose')
import router from 'server/public_routes/index'
import { masquerade } from 'server/helpers/auth'
import env from 'config/env'

Liana.collection('User', {
  actions: [{ name: 'Masquerade', type: 'single' }]
})

async function masqueradeUser(req, res) {
  const userId = req.body.data.attributes.ids[0]

  const token = await masquerade(userId)

  res.json({
    html: `<br/><b>Press the button below to log in as this user</b><br/><br/><a href="${env.DOMAIN}/masquerade?token=${token}" target="_blank"><button style="cursor: pointer">Inloggen als user</button></a><br/><br/><span style="font-size: 12px">This link will expire in 15 miuntes.</span>`
  })
}

// liana.ensureAuthenticated middleware takes care of the authentication for you.
router.post('/forest/actions/masquerade', Liana.ensureAuthenticated, masqueradeUser)

import { handler } from './index'

var bcrypt = require("bcryptjs")

it('argon test', async () => {
  const str = 'password'
  const enstr = bcrypt.hashSync(str, 10)
  console.log(enstr)
  const suc = await bcrypt.compare(str, enstr)
  expect(suc).toBeTruthy()
})

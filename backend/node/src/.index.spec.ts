var bcrypt = require("bcryptjs");

it('argon test', async () => {
  const str = 'password'
  const enstr = bcrypt.hashSync(str, 10)
  const suc = await bcrypt.compare(str, enstr)
  expect(suc).toBeTruthy();
})
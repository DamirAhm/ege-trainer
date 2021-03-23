//@ts-check
const app = require('fastify').default();
const parsers = require('./parse.js');

app.get('/', async (req, res) => {
	res.type('text/html');
	return '<img src="https://ege.sdamgia.ru/formula/svg/16/16f3b38705dc7a8f14d5a6a5fbf05a4f.svg" class="tex" style="vertical-align:-11.0pt" alt=" дробь, числитель — 1, знаменатель — корень из { 34 }.">';
});

app.listen(7777).then(() => console.log('Server listening'));

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
const pw = process.env.DB_PASSWORD;
console.log("DB_PASSWORD value:", pw);
console.log("DB_PASSWORD length:", pw?.length);
if (pw) {
    for (let i = 0; i < pw.length; i++) {
        console.log(`Char ${i}: ${pw[i]} (code: ${pw.charCodeAt(i)})`);
    }
}
console.log("DB_NAME:", process.env.DB_NAME);

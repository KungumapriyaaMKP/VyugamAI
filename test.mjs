import { initAnalyzer, analyze } from 'circle-ir';

await initAnalyzer();

const code = `
class Test {
    void search(String userInput) throws Exception {
        Statement stmt = connection.createStatement();
        stmt.executeQuery(
            "SELECT * FROM users WHERE name = '" + userInput + "'"
        );
    }
}
`;

const result = await analyze(code, 'Test.java', 'java');

console.log(JSON.stringify(result, null, 2));
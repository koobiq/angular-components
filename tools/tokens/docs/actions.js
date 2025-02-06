const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const { TYPOGRAPHY_TABLE_PLACEHOLDER_START, TYPOGRAPHY_TABLE_PLACEHOLDER_END } = require('./config');

module.exports = (StyleDictionary) => {
    StyleDictionary.registerAction({
        name: 'insert_table',
        do: async function (dictionary, { buildPath, files }) {
            const tableData = await prettier.format(
                fs.readFileSync(path.join(buildPath, files[0].destination), 'utf8'),
                { parser: 'html' }
            );

            ['typography.ru.md', 'typography.en.md'].forEach((outputFilePath) => {
                const fileData = fs.readFileSync(path.join(buildPath, outputFilePath), 'utf8');

                // Find the start and end indexes
                const startIndex = fileData.indexOf(TYPOGRAPHY_TABLE_PLACEHOLDER_START);
                const endIndex = fileData.indexOf(TYPOGRAPHY_TABLE_PLACEHOLDER_END);

                // Extract the parts before and after the content to be removed
                const beforeContent = fileData.slice(0, startIndex + TYPOGRAPHY_TABLE_PLACEHOLDER_START.length);
                const afterContent = fileData.slice(endIndex);

                // Combine the parts to create the updated file content
                const updatedFileData = `${beforeContent}\r\n${tableData}\r\n${afterContent}`;

                fs.writeFileSync(path.join(buildPath, outputFilePath), updatedFileData, 'utf8');
            });
            fs.rmSync(path.join(buildPath, files[0].destination));
            console.log('Typography styles added successfully.');
        }
    });
};

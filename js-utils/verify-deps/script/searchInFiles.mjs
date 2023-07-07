import glob from "glob";
import path from "path";
import fs from "fs";

export const searchInFiles = (searchDir, regex, pattern) => {
    let allMatches = [];
    const files = glob.sync(pattern, { cwd: searchDir });
    files.forEach(file => {
        const filePath = path.join(searchDir, file);
        if (fs.statSync(filePath).isDirectory()) {
            allMatches = allMatches.concat(searchInFiles(filePath, regex, pattern));
        } else {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const matches = fileContent.match(regex);
            if (matches) {
                allMatches = allMatches.concat(matches);
            }
        }
    });
    return allMatches;
}
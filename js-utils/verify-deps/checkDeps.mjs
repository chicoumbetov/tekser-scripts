import fs from "fs";
import Table from "cli-table";
import { comparePackages } from "./utils/comparePackages.mjs";

const packageJson = JSON.parse(fs.readFileSync('./package.json'));
const args = process.argv.slice(2);
let dev = false;

if (args.length > 0 && args[0] === '--dev') {
    dev = true;
    console.log("Checking Dev Packages")
}else{
    console.log("Checking Packages")
}

const dependencies = dev ?  packageJson.devDependencies : packageJson.dependencies

const packageInfos = await comparePackages(dependencies);

const filteredPackagesInfos = packageInfos.filter(pkg => !pkg.packageName.includes('@bim-co'));

const orderOfIcons = ["🚨", "⚠️", "🔄", "✔"];

const sortedPackagesInfos = filteredPackagesInfos.sort((a, b) => {
    const indexA = orderOfIcons.indexOf(a.etat);
    const indexB = orderOfIcons.indexOf(b.etat);
    return indexA - indexB;
});

const table = new Table({
    head: ['Package', 'Version', 'Derniere version', 'Taille (ko)', 'Dernière mise à jour', 'Utilisations', 'Popularité', 'Score', 'Etat']
});

sortedPackagesInfos.forEach(pkg => {
    table.push([
        pkg.packageName,
        pkg.packageVersion,
        pkg.lastVersion,
        pkg.size,
        pkg.date,
        pkg.usageCount,
        pkg.downloadCount,
        pkg.score,
        pkg.etat,
    ]);
});

console.log(table.toString());
import moment from "moment";
import { exec } from "child_process";
import { searchInFiles } from "./searchInFiles.mjs";
import { getRequest } from "./request.mjs";

const baseNpmUrl = "https://registry.npmjs.org"

const checkLastUpdate = async (packageName) => {
    const url = `${baseNpmUrl}/${packageName}`;

    const  response = await getRequest(url)

    const lastVersion = response?.["dist-tags"]?.latest || "N/A";
    const date = moment(response?.time?.[lastVersion]).format("DD/MM/YYYY") || "N/A";

    return { date, lastVersion };
};

const checkSize = async (packageName, packageVersion) => {
    try {
        const packageInfo = await getRequest(`${baseNpmUrl}/${packageName}/${packageVersion}`);
        if (packageInfo?.dist) {
            return ((packageInfo.dist.unpackedSize)/1000).toFixed(2);
        } else {
            return "N/A";
        }
    } catch (err) {
        console.log(err);
        return "N/A";
    }
};

const fetchScore = (packageName) => {
    const score = getRequest(`${baseNpmUrl}/-/v1/search?text=${packageName}`)
        .then(data => {
            if (data?.objects[0]?.score?.final) {
                return (parseFloat(data?.objects[0]?.score?.final) * 100)?.toFixed(2);
            } else {
                return "N/A";
            }
        })
        .catch(err => {
            console.log(err);
            return "N/A";
        });
    return score;
};


const checkUsageCount = (packageName) => {
    const currentDir = process.cwd();
    const pattern = 'Scripts/App/**/*.@(js|ts|jsx|tsx)';
    const regex =  new RegExp(`import\\s+.*\\s+from\\s+['"]${packageName}\/?.*['"]`, 'g');

    const usage = searchInFiles(currentDir, regex, pattern);

    return usage.length.toString();
};


const retrievePackageVersion = (packageName) => {
    const packagesVersion =  new Promise((resolve, reject) => {
        exec(`npm list ${packageName} --depth=0`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            let version = stdout.split(packageName)[1].replace('@','').trim();
            resolve(version);
        });
    });
    return packagesVersion;
};

const downloadCountResponse = (packageName) => {
    const downloadCount = new Promise(async (resolve, reject) => {
        try {
            const packageInfo = await getRequest(`https://api.npmjs.org/downloads/point/last-week/${packageName}`);
            if (packageInfo?.downloads) {
                resolve(packageInfo?.downloads?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
            } else {
                resolve("N/A");
            }
        } catch (err) {
            console.log(err);
            return "N/A";
        }
    });
    return downloadCount;
}

const getIcon = (version, lastVersion, score) => {
    if (version !== lastVersion && score > 40) {
        return '🔄';
    } else if (score < 40 && score > 30 && version !== lastVersion) {
        return "⚠️";
    } else if (score <= 30) {
        return "🚨";
    } else {
        return "✔";
    }
}

export const comparePackages = async (dependencies) => {
    const packageInfos = await Promise.all(
        Object.keys(dependencies).map(async packageName => {
            const { date, lastVersion } = await checkLastUpdate(packageName);
            const packageVersion = await retrievePackageVersion(packageName);
            const usageCount = checkUsageCount(packageName);
            const score = await fetchScore(packageName);
            const size = await checkSize(packageName, packageVersion);
            const downloadCount = await downloadCountResponse(packageName);
            const etat =  getIcon(packageVersion, lastVersion, score)

            return {
                packageName,
                size,
                date,
                usageCount,
                downloadCount,
                packageVersion,
                lastVersion,
                score,
                etat
            };
        })
    );

    return packageInfos;
}

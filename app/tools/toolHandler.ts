import { $ } from "bun"
import { rl } from "../utils/util_func.ts"
import kleur from "kleur"
import { blockedPatterns, riskyPatterns } from "../safety/Blocked_pattern.ts"
import { malicious_commands } from "../safety/safety.ts"
async function Read(files: string) {
    const file = Bun.file(files);
    const content = await file.text();
    return content;
}
async function Write(content: string, file_path: string) {
    await Bun.write(file_path, content);
}
async function executes(command: string,) {

    console.log("COMMAND", command);
    let canRun = await malicious_commands(blockedPatterns, riskyPatterns, command);
    if (!canRun) {
        return `Command "${command}" was blocked or not approved by the user.`;
    }
    console.log("COMMAND", command);
    try {
        let results: string;
        if (process.platform === "win32") {
            results = await $`cmd /c ${command}`.text();
        } else {
            results = await $`sh -c ${command}`.text();
        }
        return results;
    }
    catch (error: any) {
        return `command failed\n${error}`;
    }
}
async function Edit(file_path: string, old_string: string, new_string: string, replaceAll: boolean) {
    const file = Bun.file(file_path);
    const content = await file.text();
    if (!content.includes(old_string)) {
        throw new Error("oldtext not found");
    }
    let updated
    if (replaceAll) {
        console.log("Replace All is Callled");
        updated = content.replaceAll(old_string, new_string);
    }
    else {
        console.log("Replace is Called");
        updated = content.replace(old_string, new_string);
    }
    await Bun.write(file_path, updated);
    return "file edited successfully";
}
async function Glob(directory: string, pattern: string) {
    console.log("glob tool called");
    const glob = new Bun.Glob(pattern);
    const files = await Array.fromAsync(
        glob.scan({
            cwd: directory
        })
    );
    return files;
}
function toToolContent(value: any): string {
    if (typeof value === "string")
        return value;
    if (Array.isArray(value)) {
        return value.join("\n");

    }
    return JSON.stringify(value);

}
async function AskUser(question: string) {
    const answer = await rl.question(kleur.cyan(`${question}`));
    return answer;
}
export { Read, Write, executes, Edit, Glob, toToolContent, AskUser };
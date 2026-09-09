export const blockedPatterns = [
  /rm\s+-rf\s+\/(\s|$)/,           // rm -rf / or rm -rf / <something>
  /rm\s+-rf\s+~/,                   // rm -rf ~
  /rm\s+-rf\s+\*/,                  // rm -rf *
  /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/,  // fork bomb
  /mkfs\.\w+/,                      // mkfs.ext4, mkfs.xfs, etc
  /dd\s+.*of=\/dev\/(sd|nvme|hd)/,  // dd writing to a disk device
  />\s*\/dev\/(sd|nvme|hd)/,        // redirecting output onto a disk device
  />\s*\/etc\/(passwd|shadow)/,     // overwriting critical system files
];

export const riskyPatterns = [
  /\brm\b/,                         // any rm command
  /\bmv\b/,                         // any mv command
  /chmod\s+-R/,                     // recursive chmod
  /\bkill\b|\bpkill\b/,             // killing processes
  /curl.*\|\s*(sh|bash)/,           // curl piped into a shell (classic malware pattern)
  /wget.*\|\s*(sh|bash)/,           // same, via wget
  />\s*(?!\/dev\/null|\/dev\/stderr|\/dev\/stdout|&\d)/,  // redirection, EXCLUDING harmless discard targets
  /git\s+push\s+--force/,           // force push
  /git\s+reset\s+--hard/,           // hard reset
  /\.env\b|\.ssh\b|id_rsa|printenv|^env\b/,  // touching secrets/credentials
];
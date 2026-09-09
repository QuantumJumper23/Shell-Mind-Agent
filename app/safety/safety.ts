import kleur from "kleur";
import {rl} from "../utils/util_func"
export async function malicious_commands(blockedPatterns:RegExp[],riskyPatterns:RegExp[],command:string)
{
    for(const pattern of blockedPatterns)
    {
      if(pattern.test(command))
      {
        return false;
      }
    }
    let isRisky=false;
    for(const pattern of riskyPatterns)
    {
      if(pattern.test(command))
      {
        isRisky=true;
        break;
      }
    }
    if(isRisky)
    {
      const answer=await rl.question(kleur.yellow(`Agents wants to run: ${command}\nAllow?(y/n): `));
      if(answer.trim().toLowerCase()=='y')
      {
        return true;
      }
      else{
        return false;
      }
    }
    return true;
}
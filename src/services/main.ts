import { prisma } from "@/lib/db"
import { getFunctionsDefinitions } from "./function-services"

async function main() {

    const jmv= "clskc1ets0002b1efh6yz2tfd"
    const cantina= "clsnvcntc003okaqc2gfrme4b"

    let functions= await getFunctionsDefinitions(cantina)
    console.log("jmv:")    
    console.log(functions)

    functions= await getFunctionsDefinitions(jmv)
    console.log("cantina:")
    console.log(functions)
}
  
main()
  
import { PrismaClient } from "@prisma/client"
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { createOrUpdateProduct } from "@/services/product-services";

// model Product {
//   id              String    @id @default(cuid())
//   externalId      String                            // gennext: show.column
//   code            String                            // gennext: show.column
//   name            String                            // gennext: show.column
//   stock           Int                               // gennext: show.column
//   pedidoEnOrigen  Int                               // gennext: show.column
//   precioUSD       Float                             // gennext: show.column

//   category        Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
//   categoryId      String

//   sells           Sell[]                            // gennext: skip.list
// }

// model Category {
//   id              String    @id @default(cuid())
//   name            String                            // gennext: show.column
//   products        Product[]                         // gennext: skip.list
// }

// Example:
// Ranking,Cod Articulo,Articulo,Familia,En Stock,Pedido en Origen,Precio venta Publico USD 
// 1,TIDLI20031,Atornillador inalambrico de Litio 20V 55NM  2 baterias c/percutor INDUSTRIAL,220V,96,0,"195,9"
// 2,TG10711556,Amoladora 750w 4 1/2¨INDUSTRIAL Super Select,220V,3,400,"52,9"
// 3,TS11418526,"Sierra Circular 1400w 185mm 7-1/4"""" Super Select",Explosion,8,0,"107,9"
// 4,TDLI200215,Atornillador inalambrico de Litio 20V 45NM 2 baterías Super SelectINDUSTRIAL,20v,27,0,"161,9"
// 5,TAC22111550,"Set 50 pcs disco de corte de metal abrasivo 115mm(4/ 1/2"")X1.2mm Super Select",Consumibles,191,0,"29,9"

// the above csv have products and categories
// column "Ranking" is the externalId
// column "Cod Articulo" is the code
// column "Articulo" is the name
// column "Familia" is the category
// column "En Stock" is the stock
// column "Pedido en Origen" is the pedidoEnOrigen
// column "Precio venta Publico USD" is the precioUSD


export async function seedProdcuts(prisma: PrismaClient, csvPath: string) {
  const records: any[] = []
  const stream = createReadStream(csvPath, { encoding: 'utf-8' }).pipe(parse({
    delimiter: ',',
    trim: true,
    skip_empty_lines: true,
    from_line: 2, // Empieza a leer desde la segunda línea para saltar los encabezados
  }))

  // Procesar cada línea del CSV de forma asincrónica
  for await (const record of stream) {
    records.push(record)
  }

  console.log("records count", records.length)  
  
  for (const record of records) {
    try {
      const dataProduct = {
        externalId: record[0],  // Ranking
        code: record[1],        // Cod Articulo
        name: record[2],        // Articulo
        stock: parseInt(record[4]),  // En Stock
        pedidoEnOrigen: parseInt(record[5]),  // Pedido en Origen
        precioUSD: parseFloat(record[6].replace(',', '.')),  // Precio venta Publico USD
        categoryName: record[3],  // Familia
      }
      console.log(dataProduct);
      //await createOrUpdateProduct(dataProduct);
      const postUrl= "http://localhost:3000/api/cltc1dkoj01m1c7mpv5h3y00y/products/update"
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer t9EyqpztGjWNQnfOE8XRINAZe41pnuHJ'
        },
        body: JSON.stringify(dataProduct)
      })
      console.log(response)
    } catch (error) {
      console.log("Error processing record", record, error);
    }    
  }
}

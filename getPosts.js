const fs=require('fs')
const he=require('he')
const {createObjectCsvWriter } = require('csv-writer')
const stripTags = require('strip-tags')
const { promisify }=  require('util')
const readFile=promisify(fs.readFile)
const writeFile=promisify(fs.writeFile)
const mkdir=promisify(fs.mkdir)
const access=promisify(fs.access)
const axios=require('axios')
const args=process.argv.slice(2)
console.log('started')
function anglicize(text){
  if(!text)
  return null
  text=he.decode(text)
  text=stripTags(text)
  let englishText=text.replace(/[^\x00-\x7F]+/g, '').replace(/(\n|&#x200B;)[^\n&#x200B;]*(\n|&#x200B;)/g, ' ').replace(/"https?:\/\/[^\s"]+"/g, '').replace(/\n/g, '');
  return englishText
}
async function writeJsonFile(communityName,categorey){
try{
 let res=fs.existsSync(`./json-communities/${categorey}.json`)
 if(!res){
  console.log('no json file was found creating one')
   await mkdir(`./json-communities/`,{recursive:true})
    await writeFile(`./json-communities/${categorey}.json`,JSON.stringify({categorey,communities:[]}))
  }
 let data= await readFile(`./json-communities/${categorey}.json`)
 data=JSON.parse(data)
  data.communities.push(communityName)
  await writeFile(`./json-communities/${categorey}.json`,JSON.stringify(data))
  console.log('json file was updated')
}
catch(err){
  console.log(err)
}

}
  function mapPosts(posts){
  let selftexts= posts.map(({data})=>{
    return {
      post:anglicize(data.selftext),
      categorey:args[0]
     }})
     let titles=posts.map(({data})=>{
      return {
        post:anglicize(data.title),
        categorey:args[0]
      }
     })
let results=titles.concat(selftexts)
results=results.filter(post=>post.post)
     return results
}
function writeRecords(posts){
  const csvWriter=createObjectCsvWriter ({
    path:args[1],
    header:[{
      id:'categorey',
      title:'categorey'
    },{
      id:'post',
      title:'post'
    }]
    ,append:true})
    csvWriter.writeRecords(posts).then(()=>console.log('data was added successfully')).catch((err)=>console.log(err.message))
  }


if(args.length!==3){
  console.log('you have to pass the name of the file path the name of the subReddit')
  process.exit()
}
let subReddit=args[2]
console.log(`getting 100 post from the subReddit ${subReddit}`)
async function getPosts(){
try{
  let   url=`https://www.reddit.com/r/${subReddit}/new.json?limit=100`
  let res=await  axios.get(url)
    let posts=mapPosts(res.data.data.children)
    writeRecords(posts)
    writeJsonFile(subReddit,args[0])
  }
  catch(err){
    console.log(err)
    process.exit()
  } 
} 
getPosts()
this node script is used to fetch reddit communities last 100 post and save them in a csv file than consists of two column {category, text} plus creating json files for listing communities you fetched 
this was originally created to make a data set of text categorized based on the sport
you have to install node


run : npm i


run node getPosts.js <category> <path of csv file> <subreddit name>

  
 ex: node getPosts.js football ./csv-files/ 'football'

note:this script saves the title of the post and the describtion of it 

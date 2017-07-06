del index.zip 
cd src 
7z a -r ..\index.zip *
cd .. 
aws lambda update-function-code --function-name MyTriviaGame --zip-file fileb://index.zip
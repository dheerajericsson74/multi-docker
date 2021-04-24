const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const sub = redisClient.duplicate();

function fib(index){
    //console.log('Inside Worker : fib method is called with index '+ index);
    if(index < 2) {
        return 1;
    }else{
        return fib(index-1) + fib(index - 2);
    }
}

sub.on('message', (channel,message )=> {
    console.log('Inside Worker : setting the fib value for '+ message);
  redisClient.hset('values', message, fib(parseInt(message)));
});

sub.subscribe('insert');
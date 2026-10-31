import {fit} from './optimizer';
import type {Sample,Config} from './optimizer';
self.onmessage=(event:MessageEvent<{samples:Sample[];config:Config}>)=>{
 try{self.postMessage({result:fit(event.data.samples,event.data.config)});}
 catch(error){self.postMessage({error:String(error)});}
};

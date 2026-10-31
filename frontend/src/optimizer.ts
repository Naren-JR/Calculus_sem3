export interface Sample {speed_mps:number;force_N:number;force_without_noise_N:number}
export interface Config {initial_c0?:number;initial_c2?:number;learning_rate?:number;iterations?:number}
export interface Iteration {step:number;c0:number;c2:number;theta0:number;theta1:number;loss:number;gradient:number[];gradient_norm:number;rmse:number}
export function fit(samples:Sample[],config:Config={}) {
 const {initial_c0=0,initial_c2=0,learning_rate=.15,iterations=2000}=config;
 for(const [v,min,max] of [[initial_c0,0,1000],[initial_c2,0,1],[learning_rate,Number.MIN_VALUE,3],[iterations,1,10000]])
  if(!Number.isFinite(v)||v<min||v>max)throw Error('Invalid optimizer settings. Check parameter ranges.');
 if(!Number.isInteger(iterations))throw Error('Iterations must be a whole number.');
 if(samples.length<2||samples.some(s=>!Number.isFinite(s.speed_mps)||s.speed_mps<0||!Number.isFinite(s.force_N)))throw Error('Invalid speed–force observations.');
 const x=samples.map(s=>(s.speed_mps/50)**2),y=samples.map(s=>s.force_N),n=x.length;
 const mean=(a:number[])=>a.reduce((s,v)=>s+v,0)/n;
 const mx=mean(x),my=mean(y),mxx=mean(x.map(v=>v*v));
 const variance=mean(x.map(v=>(v-mx)**2));
 if(variance<1e-14)throw Error('At least two distinct squared speeds are required.');
 const slope=mean(x.map((v,i)=>(v-mx)*(y[i]-my)))/variance;
 const reference={c0:my-slope*mx,c2:slope/2500};
 const eigenMax=(1+mxx+Math.sqrt((1-mxx)**2+4*mx*mx))/2;
 let a=initial_c0,b=initial_c2*2500,status='Maximum iterations reached';
 const history:Iteration[]=[];
 for(let step=0;step<=iterations;step++){
  const residual=x.map((v,i)=>a+b*v-y[i]);
  const loss=mean(residual.map(v=>v*v))/2;
  const gradient=[mean(residual),mean(residual.map((v,i)=>v*x[i]))];
  if(!Number.isFinite(loss)||loss>1e18){status='Diverged: reduce the learning rate';break;}
  const norm=Math.hypot(...gradient);
  history.push({step,c0:a,c2:b/2500,theta0:a,theta1:b,loss,gradient,gradient_norm:norm,rmse:Math.sqrt(2*loss)});
  if(norm<1e-8){status='Converged';break;}
  if(step<iterations){a-=learning_rate*gradient[0];b-=learning_rate*gradient[1];}
 }
 return {history,status,reference,stable_rate_upper_bound:2/eigenMax,
  config:{initial_c0,initial_c2,learning_rate,iterations},source:'Synthetic supplied CSV; force_N target; speed scale 50 m/s'};
}

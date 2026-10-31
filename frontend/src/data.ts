import csv from '../../data/synthetic_vehicle_resistance_dataset.csv?raw';
import metadata from '../../data/synthetic_vehicle_resistance_dataset_metadata.json';
import track from '../../data/track.json';
import vehicle from '../../data/vehicle.json';
const lines=csv.trim().split(/\r?\n/);
const headers=lines.shift()!.split(',');
const samples=lines.map(line=>Object.fromEntries(line.split(',').map((value,i)=>[headers[i],Number(value)]))) as {speed_mps:number;force_N:number;force_without_noise_N:number}[];
export const dataset={samples,metadata,track,vehicle};

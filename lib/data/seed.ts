import type {AppStore,BrandVoice,Project,CopyGeneration} from '@/types';
export const brandVoices:BrandVoice[]=[
 {id:'pulse',name:'Pulse',description:'Calm, precise and reassuring for financial product experiences.',personality:['Calm','Trustworthy','Human'],rules:['Use plain language','State consequences before commitment','Prefer specific actions over generic labels']},
 {id:'studio',name:'Studio',description:'Confident and concise for creative tools.',personality:['Confident','Direct','Warm'],rules:['Lead with the outcome','Keep actions short','Avoid filler phrases']}
];
export const projects:Project[]=[
 {id:'pulse',name:'Pulse Banking',description:'Core banking flows and account safety.',audience:'Consumers',brandVoiceId:'pulse',guidelines:['Plain language','Explain irreversible actions','Never blame the user'],copyCount:34,avgScore:91,updatedAt:'Today'},
 {id:'atlas',name:'Atlas Analytics',description:'B2B analytics workspace and reporting.',audience:'Business',brandVoiceId:'studio',guidelines:['Be concise','Use active voice','Name the result'],copyCount:21,avgScore:86,updatedAt:'Yesterday'},
 {id:'orbit',name:'Orbit Commerce',description:'Checkout, account and order experiences.',audience:'Consumers',copyCount:18,avgScore:84,updatedAt:'3 days ago'}
];
export const generations:CopyGeneration[]=[
 {id:'g1',projectId:'pulse',component:'Confirmation',product:'Fintech application',goal:'Delete bank account safely',action:'User clicks delete',audience:'Consumers',tone:'Empathetic',headline:'Delete your bank account?',body:'This will permanently remove your account and transaction history. This action cannot be undone.',primaryAction:'Delete account',secondaryAction:'Cancel',supportingText:'Download anything you need before continuing.',score:92,analysis:{clarity:94,accessibility:91,tone:93,conciseness:89,confidence:92,strengths:['Clear action','Explains consequence','Plain language'],improvements:['Shorten supporting text','Keep destructive action explicit']},createdAt:'Today'},
 {id:'g2',projectId:'atlas',component:'Error',product:'Analytics workspace',goal:'Recover from failed report load',action:'Report request fails',audience:'Business',tone:'Professional',headline:'We couldn’t load this report',body:'Check your connection and try again. Your saved report is still available.',primaryAction:'Try again',secondaryAction:'Back to reports',supportingText:'If the problem continues, contact your workspace admin.',score:87,analysis:{clarity:89,accessibility:90,tone:86,conciseness:84,confidence:86,strengths:['Clear recovery path','Does not blame the user'],improvements:['Offer support context after retry']},createdAt:'Yesterday'}
];
export const initialStore:AppStore={projects,brandVoices,generations};

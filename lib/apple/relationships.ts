import type{AppleResource}from"./types";
type Linkage={type?:string;id?:string};
export function relationshipId(resource:AppleResource,name:string){const relation=resource.relationships?.[name]as{data?:Linkage|null}|undefined;return relation?.data?.id}

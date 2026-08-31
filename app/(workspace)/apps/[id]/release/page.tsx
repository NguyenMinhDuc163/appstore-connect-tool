import{redirect}from"next/navigation";export default async function AppRelease({params}:{params:Promise<{id:string}>}){const{id}=await params;redirect(`/releases?appId=${encodeURIComponent(id)}`)}

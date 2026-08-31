import{redirect}from"next/navigation";export default async function AppAnalytics({params}:{params:Promise<{id:string}>}){const{id}=await params;redirect(`/analytics?appId=${encodeURIComponent(id)}`)}

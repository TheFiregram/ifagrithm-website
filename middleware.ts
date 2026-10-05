import { NextRequest, NextResponse } from "next/server";
import { allowsRequestOrigin } from "./lib/request-origin";
// Same-origin mutations stop external sites from issuing administrative actions.
export function middleware(request:NextRequest){
 if(!allowsRequestOrigin(request))return NextResponse.json({error:"Invalid request origin"},{status:403,headers:{"cache-control":"private, no-store"}});
 return NextResponse.next();
}
export const config={matcher:["/api/:path*"]};

import { NextRequest, NextResponse } from "next/server";
// Same-origin mutations stop external sites from issuing administrative actions.
export function middleware(request:NextRequest){
 if(request.method!=="GET" && request.method!=="HEAD"){
  const origin=request.headers.get("origin");
  const expected=new URL(request.url).origin;
  if(origin && origin!==expected)return NextResponse.json({error:"Invalid request origin"},{status:403});
 }
 return NextResponse.next();
}
export const config={matcher:["/api/admin/:path*"]};

// why api ? CORS issue with the country detection API: Your application is getting blocked when trying to fetch country data from ipapi.co.

// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req) {
//    const forwarded = req.headers.get("x-forwarded-for");
//    const ip = forwarded ? forwarded.split(",")[0] : "Unknown";

//    try {
//       const response = await fetch(`https://ipapi.co/${ip}/json/`, {
//          headers: {
//             "User-Agent": "Mozilla/5.0 (compatible; MyApp/1.0)",
//          },
//       });

//       if (!response.ok) {
//          throw new Error(`HTTP error ${response.status}`);
//       }

//       const data = await response.json();
//       console.log(data, "data from country");
//       return NextResponse.json(data);
//    } catch (error) {
//       console.error("Error fetching country data:", error);
//       return NextResponse.json({ error: error.message }, { status: 500 });
//    }
// }

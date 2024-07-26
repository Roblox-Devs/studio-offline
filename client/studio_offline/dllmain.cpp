#include <Windows.h>
#include <cstdio>
#include <cstdint>
#include <widemath.h>
#include "MinHook.h"

#include "chris_stuff/scanner.hpp"
#include "chris_stuff/patterns.hpp"
#include <iostream>
#include <__msvc_int128.hpp>
#include <filesystem>



typedef void (__fastcall* fromcomponents_t)(uint128_t* res, uintptr_t schema, uintptr_t host, uintptr_t path, uintptr_t query, uintptr_t fragment);
typedef uint64_t* (__fastcall* trustcheck_t)(const char* Str1, char a2, char a3);
typedef char* (__fastcall* httprequest_nottrusted)(uintptr_t* a1, uintptr_t a2);
trustcheck_t trustMeBuddy = nullptr;
trustcheck_t og_tc = nullptr;

fromcomponents_t abcd = nullptr;
fromcomponents_t original = nullptr;

httprequest_nottrusted hookedVer = nullptr;
httprequest_nottrusted originalHttpNT = nullptr;


void hook_test(uint128_t* res, uintptr_t schema, uintptr_t host, uintptr_t path, uintptr_t query, uintptr_t fragment) {
    const auto host_str = reinterpret_cast<const char*>(
        *reinterpret_cast<uintptr_t*>(host)
        );
    const char* str = "localhost";
    const char* scheme_str = "http";
    *reinterpret_cast<uintptr_t*>(host) = reinterpret_cast<uintptr_t>(str);
    *reinterpret_cast<uintptr_t*>(host + 0x8) = strlen(str);

    *reinterpret_cast<uintptr_t*>(schema) = reinterpret_cast<uintptr_t>(scheme_str);
    *reinterpret_cast<uintptr_t*>(schema + 0x8) = strlen(scheme_str);
    original(res, schema, host, path, query, fragment);
}
uint64_t* trustcheck_hook(const char* Str1, char a2, char a3) {
    std::string url(Str1);
    const char* str = "http://roblox.com";
    if (url.find("http://localhost") != std::string::npos && a3 == 0) {
        Str1 = str;
        return og_tc(str, a2, a3);
    }
    return og_tc(Str1, a2, a3);
}
char* nottrusted_hook(uintptr_t* a1, uintptr_t a2) {
    const auto urlfroma2 = reinterpret_cast<const char*>(*reinterpret_cast<uintptr_t*>(a2));
    char ret[] = "1";
    return ret;
}

BOOL APIENTRY DllMain(HMODULE hModule, DWORD ul_reason_for_call, LPVOID lpReserved)
{
    if (ul_reason_for_call == DLL_PROCESS_ATTACH)
    {
        bool offline_enabled = std::filesystem::exists("OFFLINE_STUDIO");
        if (offline_enabled) {
	    FILE* f;
            AllocConsole();
            freopen_s(&f, "CONIN$", "r", stdin);
            freopen_s(&f, "CONOUT$", "w", stdout);
            printf("Starting Studio-Offline\n");
            const auto addr = aob_scan(patterns::url_oncomponent);
            const auto trustcheck_addr = aob_scan(patterns::trustcheck);
            const auto httprequest_addr = aob_scan(patterns::HttpRequestURL);
            if (addr) {
                MH_Initialize();
                printf("FromComponents: 0x%p\n", *addr);
                printf("TrustCheck: 0x%p\n", *trustcheck_addr);
                printf("HttpRequest_notTrusted: 0x%p\n", *httprequest_addr);
                abcd = (fromcomponents_t)*addr;

                MH_CreateHook(abcd, hook_test, reinterpret_cast<LPVOID*>(&original));
                MH_EnableHook(abcd);

                trustMeBuddy = (trustcheck_t)*trustcheck_addr;
                MH_CreateHook(trustMeBuddy, trustcheck_hook, reinterpret_cast<LPVOID*>(&og_tc));
                MH_EnableHook(trustMeBuddy);

                hookedVer = (httprequest_nottrusted)*httprequest_addr;
                MH_CreateHook(hookedVer, nottrusted_hook, reinterpret_cast<LPVOID*>(&originalHttpNT));
                MH_EnableHook(hookedVer);
            }
        }



    }
    return TRUE;
}

#pragma once
#define WIN32_LEAN_AND_MEAN

#include <windows.h>

#include <optional>
#include <psapi.h>
#include <windows.h>
#include <iostream>
#include <TlHelp32.h>
#include "patterns.hpp"

std::optional<std::uintptr_t> aob_scan(const char* pattern, const char* mask) {
    auto module_info = MODULEINFO{};
    auto page_info = MEMORY_BASIC_INFORMATION{};

    GetModuleInformation(GetCurrentProcess(), GetModuleHandleA("RobloxStudioBeta.exe"), &module_info, sizeof(MODULEINFO));

    const auto module_base = reinterpret_cast<char*>(module_info.lpBaseOfDll);
    const auto module_size = module_info.SizeOfImage;
    const auto pattern_len = strlen(mask);

    for (auto i = module_base; i < module_base + module_size; i += page_info.RegionSize) {
        if (!VirtualQuery(i, &page_info, sizeof(page_info))) {
            continue;
        };

        if (page_info.State != MEM_COMMIT || page_info.Protect == PAGE_NOACCESS) {
            continue;
        }

        for (auto j = 0; j < page_info.RegionSize; j++) {
            auto found = true;

            for (auto k = 0; k < pattern_len; k++) {
                auto char_ptr = reinterpret_cast<intptr_t>(i + j + k);

                if (mask[k] != '?' && pattern[k] != *reinterpret_cast<char*>(char_ptr)) {
                    found = false;
                    break;
                }
            }

            if (found) {
                return reinterpret_cast<uintptr_t>(i + j);
            }
        }
    }

    return std::nullopt;
}

std::optional<std::uintptr_t> aob_scan(Pattern pattern) {
    return aob_scan(pattern.pattern, pattern.mask);
}
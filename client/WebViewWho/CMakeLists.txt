cmake_minimum_required(VERSION 3.14)

set(PROJECT_NAME WebViewWho)
project(${PROJECT_NAME})

################################################################################
# Source groups
################################################################################
set(Header_Files
    "framework.h"
    "pch.h"
)
source_group("Header Files" FILES ${Header_Files})

set(Source_Files
    "dllmain.cpp"
    "pch.cpp"
)
source_group("Source Files" FILES ${Source_Files})

set(ALL_FILES
    ${Header_Files}
    ${Source_Files}
)

################################################################################
# Target
################################################################################
add_library(${PROJECT_NAME} SHARED ${ALL_FILES})

target_precompile_headers(${PROJECT_NAME} PRIVATE
    "$<$<COMPILE_LANGUAGE:CXX>:${CMAKE_CURRENT_SOURCE_DIR}/pch.h>"
)

set_target_properties(${PROJECT_NAME} PROPERTIES
    VS_GLOBAL_KEYWORD "Win32Proj"
)

if(CMAKE_VS_PLATFORM_NAME STREQUAL "x64")
    set_target_properties(${PROJECT_NAME} PROPERTIES
        TARGET_NAME_RELEASE "WebView2Loader"
        INTERPROCEDURAL_OPTIMIZATION_RELEASE "TRUE"
    )
elseif(CMAKE_VS_PLATFORM_NAME STREQUAL "x86")
    set_target_properties(${PROJECT_NAME} PROPERTIES
        INTERPROCEDURAL_OPTIMIZATION_RELEASE "TRUE"
    )
endif()

################################################################################
# Compile definitions
################################################################################
if(CMAKE_VS_PLATFORM_NAME STREQUAL "x64" OR CMAKE_VS_PLATFORM_NAME STREQUAL "x86")
    target_compile_definitions(${PROJECT_NAME} PRIVATE
        "$<$<CONFIG:Debug>:_DEBUG>"
        "$<$<CONFIG:Release>:NDEBUG>"
        "WEBVIEWWHO_EXPORTS"
        "_WINDOWS"
        "_USRDLL"
        "UNICODE"
        "_UNICODE"
    )
endif()

################################################################################
# Compile and link options
################################################################################
if(MSVC)
    target_compile_options(${PROJECT_NAME} PRIVATE
        $<$<CONFIG:Release>:/Oi;/Gy;/Y->
        /permissive-
        /sdl
        /W3
        ${DEFAULT_CXX_DEBUG_INFORMATION_FORMAT}
        ${DEFAULT_CXX_EXCEPTION_HANDLING}
    )

    target_link_options(${PROJECT_NAME} PRIVATE
        $<$<CONFIG:Release>:/OPT:REF;/OPT:ICF>
        /DEBUG
        /SUBSYSTEM:WINDOWS
    )
endif()

#ifndef BT_NODES_EXPORT_HPP
#define BT_NODES_EXPORT_HPP

#if defined(_WIN32) || defined(__CYGWIN__)
#  if defined(BT_NODES_BUILDING_LIBRARY)
#    define BT_NODES_EXPORT __declspec(dllexport)
#  else
#    define BT_NODES_EXPORT __declspec(dllimport)
#  endif
#elif defined(__GNUC__) || defined(__clang__)
#  define BT_NODES_EXPORT __attribute__((visibility("default")))
#else
#  define BT_NODES_EXPORT
#endif

#endif  // BT_NODES_EXPORT_HPP

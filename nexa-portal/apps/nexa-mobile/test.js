try {
  console.log(require.resolve('@react-native/gradle-plugin/package.json', { paths: [require.resolve('react-native/package.json', { paths: [process.cwd()] })] }));
} catch (e) {
  console.error("RN PLUGIN ERROR:", e.message);
}
try {
  console.log(require.resolve('expo-modules-autolinking/package.json', { paths: [require.resolve('expo/package.json', { paths: [process.cwd()] })] }));
} catch (e) {
  console.error("EXPO PLUGIN ERROR:", e.message);
}
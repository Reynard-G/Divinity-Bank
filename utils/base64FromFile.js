export default async function base64FromFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const base64 = fileReader.result.split(',')[1];
      resolve(base64);
    };
    fileReader.onerror = (error) => reject(error);
    fileReader.readAsDataURL(file);
  });
}

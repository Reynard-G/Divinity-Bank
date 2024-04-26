export default async function base64FromFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
    fileReader.readAsDataURL(file);
  });
}

import user_avatar from '@/assets/user_avatar.svg';
function isImageByLoading(path?: string | undefined): Promise<string> {
  return new Promise(resolve => {
    if (!path) {
      resolve(user_avatar);
      return;
    }

    const img = new Image();
    img.onload = function () {
      resolve(path);
    };
    img.onerror = function () {
      resolve(user_avatar);
    };
    img.src = path;
  });
}

export default isImageByLoading;

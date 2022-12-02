
from formatter import NullWriter
from venv import create
import cv2
import sys
import os
import os.path
import platform
capture_on = False
createImageFalg = False
capture_type = ''

osName = platform.system()
if(osName == "Windows"):
    cam = cv2.VideoCapture(0)
else: cam = cv2.VideoCapture(cv2.CAP_V4L2)
print("os" + osName)

face_classifier = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')



def onCam():
    global cam
    if(osName == "Windows"):
        cam = cv2.VideoCapture(0)
    else: cam = cv2.VideoCapture(cv2.CAP_V4L2)
    cam.set(cv2.CAP_PROP_FRAME_WIDTH, 500)
    cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            # #리눅스
            # #cam = cv2.VideoCapture(cv2.CAP_V4L2)
            # #윈도우
            # cam = cv2.VideoCapture(0)
            # print(cam)
            # cam.set(cv2.CAP_PROP_FRAME_WIDTH, 500)
            # cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    print('onCam 얼굴인식 : 카메라 켜짐')
    return True
    # if (cam == None):
    #     if(osName == "Windows"):
    #         cam = cv2.VideoCapture(0)
    #     else: cam = cv2.VideoCapture(cv2.CAP_V4L2)
    #     cam.set(cv2.CAP_PROP_FRAME_WIDTH, 500)
    #     cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    #     # #리눅스
    #     # #cam = cv2.VideoCapture(cv2.CAP_V4L2)
    #     # #윈도우
    #     # cam = cv2.VideoCapture(0)
    #     # print(cam)
    #     # cam.set(cv2.CAP_PROP_FRAME_WIDTH, 500)
    #     # cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    #     print('onCam 얼굴인식 : 카메라 켜짐')
    #     return True
    # return True


def closeCam():
    global cam
    print('카메라꺼짐')
    cam.release()
    #cam = None

def face_extractor(img):

    if(img is None):
        print("img is None")
        return None
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_classifier.detectMultiScale(gray, 1.3, 5)

    #찾는 얼굴이 없으면 None Return
    if faces == ():
        return None

    for (x, y, w, h) in faces:
        cropped_face = img[y:y+h, x:x+w]

    return cropped_face


def createCropImage(userName, dir_path, countN):
    # global cam
    # if(cam == None):
    #     onCam()

    # elif(cam != None):
    #     if not cam.isOpened():
    #        onCam()
    # else:
    #     print("createImage")
    #onCam()
    global cam

    dir_path = os.path.join(dir_path, userName)
    count = 0
    #폴더 생성
    if not (os.path.exists(dir_path)):
        os.mkdir(dir_path)
        print(dir_path + "폴더생성 완료")
    if(cam.isOpened()):
        while True:
            ret, frame = cam.read()
            if face_extractor(frame) is not None:
                count += 1
                face = cv2.resize(face_extractor(frame), (160, 160))
                face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
                file_name_path = str(count) + '.jpg'
                #크롭된 이미지 저장
                #face/login/user
                cv2.imwrite(dir_path + '/'+file_name_path, face)
            else:
                print("Face not Found")
                pass

            if cv2.waitKey(1) == 13 or count == countN:
                break

        cv2.destroyAllWindows()
        return dir_path


def load_image(directory):
    byteArr = list()
    count = 0
    for filename in os.listdir(directory):
        count = count + 1
        path = str(directory) +os.sep + str(filename)
        f = open(path,"rb")
        filecontent = f.read()
        byteArr.append(bytearray(filecontent))
    return byteArr
        
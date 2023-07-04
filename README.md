# Twip-Toonation-Afreehp-Parser-Example

- Nodejs example for parsing donation notifications from Afreeca helper, Twip, and Toonation
- ~~Afreeca helper~~, Twip, Toonation 의 도네이션 알림을 파싱하기 위한 Nodejs 예제
- Contact: nomotg@gmail.com

## How to install

- git clone https://github.com/nomomo/Twip-Toonation-Afreehp-Parser-Example.git
- npm install

## How to use

- index.js 파일을 열어 settings 의 alertbox_url 을 자신의 ~~Afreeca helper~~, Twip, Toonation 의 Alert Box URL 으로 수정합니다.
- 사용하고 싶지 않은 플랫폼이 있는 경우, settings 의 use 를 false 로 바꿉니다.
- 스크립트 실행 후, 알람 테스트를 통해 어떤 응답이 오는지 확인합니다.
- Afreeca helper 관련 기능은 현재 동작하지 않는 것 같습니다.

## Key point

### Afreeca helper

- Socket.IO
- Socket.IO v2.x 서버를 사용하므로 Client 도 v2.x 버전을 사용해야 함.
- Alert box url 로부터 idx 값 파싱 필요
- Socket.IO 연결 후, idx 값을 emit 하는 순간부터 본인 Alert box 의 알림을 가져올 수 있음

### Twip

- WebSocket
- Alert box url 로부터 token, version 값 파싱 필요
- 일정 주기(약 20~30초) 간격으로 ping 에 해당하는 메시지를 보내야 연결이 종료되지 않음

### Toonation

- 현재 동작 안 함
- WebSocket
- Alert box url 로부터 payload 값 파싱 필요
- 일정 주기(약 12초) 간격으로 ping 을 보내야 연결이 종료되지 않음

## Change Logs

### 1.0.4 (Jul. 4, 2023)

- Afreehp 의 cmd 외 모든 이벤트를 받아올 수 있는 코드 추가
- Afreeca helper 관련 기능은 현재 동작하지 않는 것 같습니다.

### 1.0.3 (Mar. 1, 2022)

- Toonation 연결이 끊긴 경우 Ping 을 보내지 않도록 수정 (jamesleegit 님 감사해요!)

### 1.0.2 (Jan. 3, 2022)

- Twip 파싱 방식을 Socket.io 에서 WebSocket 으로 변경 (Mackbex 님 감사해요!)

### 1.0.1 (Jun. 9, 2021)

- Initial Commit

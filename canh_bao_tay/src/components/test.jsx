1)

import java.io.*;
import java.net.*;
import UDP.Book;


public class _6jbWaevI_UDP_Object {
    public static void main(String[] args) {
        String studentCode = "B22DCCN129";  // thay bằng MSSV của bạn
        String qCode = "6jbWaevI";
        String message = ";" + studentCode + ";" + qCode;
        int serverPort = 2209;

        DatagramSocket socket = null;

        try {
            socket = new DatagramSocket();
            InetAddress serverAddress = InetAddress.getByName("203.162.10.109");

            // --- Gửi thông điệp ban đầu ---
            byte[] sendData = message.getBytes();
            DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length, serverAddress, serverPort);
            socket.send(sendPacket);
            System.out.println("Đã gửi yêu cầu: " + message);

            // --- Nhận dữ liệu từ server ---
            byte[] receiveData = new byte[4096];
            DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);
            socket.receive(receivePacket);
            System.out.println("Đã nhận gói tin từ server.");

            // --- Tách requestId (8 byte đầu) ---
            byte[] data = receivePacket.getData();
            String requestId = new String(data, 0, 8, "UTF-8");

            // --- Giải tuần tự đối tượng Book ---
            ByteArrayInputStream bais = new ByteArrayInputStream(data, 8, receivePacket.getLength() - 8);
            ObjectInputStream ois = new ObjectInputStream(bais);
            Book book = (Book) ois.readObject();
            ois.close();

            System.out.println("Dữ liệu nhận được:");
            System.out.println(book);

            // --- Chuẩn hóa dữ liệu ---
            book.setTitle(capitalizeWords(book.getTitle()));
            book.setAuthor(formatAuthor(book.getAuthor()));
            book.setIsbn(formatIsbn(book.getIsbn()));
            book.setPublishDate(formatDate(book.getPublishDate()));

            System.out.println("Sau chuẩn hóa:");
            System.out.println(book);

            // --- Gửi lại cho server ---
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ObjectOutputStream oos = new ObjectOutputStream(baos);
            oos.writeObject(book);
            oos.flush();

            byte[] objectBytes = baos.toByteArray();
            byte[] responseData = new byte[8 + objectBytes.length];
            System.arraycopy(requestId.getBytes("UTF-8"), 0, responseData, 0, 8);
            System.arraycopy(objectBytes, 0, responseData, 8, objectBytes.length);

            DatagramPacket responsePacket = new DatagramPacket(responseData, responseData.length, serverAddress, serverPort);
            socket.send(responsePacket);
            System.out.println("Đã gửi lại đối tượng Book đã chuẩn hóa về server.");

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (socket != null && !socket.isClosed()) socket.close();
        }
    }

    // --- Các hàm chuẩn hóa ---
    private static String capitalizeWords(String input) {
    if (input == null || input.isEmpty()) return input;
    String[] words = input.trim().split("\\s+");
    StringBuilder sb = new StringBuilder();
    for (String w : words) {
        if (w.length() == 0) continue;
        sb.append(Character.toUpperCase(w.charAt(0)));
        if (w.length() > 1) sb.append(w.substring(1).toLowerCase());
        sb.append(' ');
    }
    return sb.toString().trim();
}


    private static String formatAuthor(String input) {
    if (input == null || input.trim().isEmpty()) return input;
    String[] parts = input.trim().split("\\s+");
    if (parts.length == 1) {
        return parts[0].toUpperCase();
    }
    String family = parts[0].toUpperCase();          // từ đầu -> HỌ (in hoa)
    StringBuilder rest = new StringBuilder();
    for (int i = 1; i < parts.length; i++) {
        String w = parts[i];
        if (w.length() == 0) continue;
        rest.append(Character.toUpperCase(w.charAt(0)));
        if (w.length() > 1) rest.append(w.substring(1).toLowerCase());
        if (i < parts.length - 1) rest.append(' ');
    }
    return family + ", " + rest.toString();
}


    private static String formatIsbn(String raw) {
    if (raw == null) return raw;
    String digits = raw.replaceAll("\\D", ""); // giữ chỉ chữ số
    if (digits.length() == 13) {
        // chia theo nhóm 3-1-2-6-1 để khớp expected ví dụ
        int[] groups = {3,1,2,6,1};
        StringBuilder sb = new StringBuilder();
        int idx = 0;
        for (int g = 0; g < groups.length; g++) {
            if (idx + groups[g] > digits.length()) return digits; // fallback
            if (g > 0) sb.append("-");
            sb.append(digits.substring(idx, idx + groups[g]));
            idx += groups[g];
        }
        return sb.toString();
    }
    // Nếu không phải 13 chữ số, trả về nguyên bản (hoặc apply khác tuỳ đề)
    return raw;
}


    private static String formatDate(String date) {
    if (date == null || !date.matches("\\d{4}-\\d{2}-\\d{2}")) return date;
    String[] p = date.split("-");
    return p[1] + "/" + p[0];
}

}


2)
import java.io.*;
import java.net.*;
import TCP.Laptop;

public class Fp4dn4S5_TCP_ObjectStream {
    public static void main(String[] args) {
        String studentCode = "B22DCCN129";
        String qCode = "Fp4dn4S5";
        String host = "203.162.10.109";
        int port = 2209;

        try (Socket socket = new Socket(host, port)) {
            socket.setSoTimeout(5000);

            ObjectOutputStream oos = new ObjectOutputStream(socket.getOutputStream());
            ObjectInputStream ois = new ObjectInputStream(socket.getInputStream());

            // B1. Gửi chuỗi định danh
            oos.writeObject(studentCode + ";" + qCode);
            oos.flush();

            // B2. Nhận đối tượng Laptop
            Object obj = ois.readObject();
            if (obj instanceof Laptop) {
                Laptop laptop = (Laptop) obj;
                System.out.println("Received: " + laptop);

                // B3. Sửa thông tin bị đảo
                // --- a) Đổi vị trí từ đầu và từ cuối ---
                String[] parts = laptop.getName().trim().split("\\s+");
                if (parts.length >= 2) {
                    String temp = parts[0];
                    parts[0] = parts[parts.length - 1];
                    parts[parts.length - 1] = temp;
                }
                String fixedName = String.join(" ", parts);
                laptop.setName(fixedName);

                // --- b) Đảo ngược số lượng ---
                String reversed = new StringBuilder(String.valueOf(laptop.getQuantity())).reverse().toString();
                laptop.setQuantity(Integer.parseInt(reversed));

                System.out.println("Fixed: " + laptop);

                // B4. Gửi lại đối tượng đã sửa
                oos.writeObject(laptop);
                oos.flush();
            }

            socket.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}



3) Data -TCP
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;

public class FzIeQkLg_TCP_DataStream {
    public static void main(String[] args) throws IOException {
        // a. Thông tin cấu hình
        String studentCode = "B22DCCN129";  // 🔹 Mã sinh viên của bạn
        String qCode = "FzIeQkLg";          // 🔹 Mã câu hỏi
        String host = "203.162.10.109";     // 🔹 Địa chỉ server
        int port = 2207;                    // 🔹 Cổng TCP
        // Kết nối tới server
        Socket socket = new Socket(host, port);

        try {
            socket.setSoTimeout(5000);
            DataInputStream dis = new DataInputStream(socket.getInputStream());
            DataOutputStream dos = new DataOutputStream(socket.getOutputStream());
            // Giới hạn thời gian tối đa cho mỗi yêu cầu là 5 giây
            

            // a. Gửi chuỗi "studentCode;qCode" tới server
            String message = studentCode + ";" + qCode;
            dos.writeUTF(message);  // Gửi đúng định dạng UTF
            dos.flush();
            System.out.println(">> Đã gửi: " + message);

            // b. Nhận số nguyên hệ thập phân từ server
            int number = dis.readInt();
            System.out.println(">> Nhận từ server: " + number);

            // c. Chuyển sang hệ nhị phân
            String binary = Integer.toBinaryString(number);
            System.out.println(">> Dạng nhị phân: " + binary);

            // Gửi lại chuỗi nhị phân cho server
            dos.writeUTF(binary);
            dos.flush();
            System.out.println(">> Đã gửi lại cho server: " + binary);

            // d. Đóng kết nối
            System.out.println(">> Hoàn tất, đóng kết nối...");

        } catch (IOException e) {
            System.err.println("⚠️ Lỗi khi giao tiếp với server: " + e.getMessage());
        }
    }
}


4)DataType-UDP
/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.io.IOException;
import java.net.SocketException;
import java.net.UnknownHostException;

/**
 *
 * @author pc
 */
public class MQmrwaFo_UDP_DataType {
    public static void main(String[] args) {
        String studentCode = "B22DCCN129"; // 🔹 Mã sinh viên thực tế
        String qCode = "MQmrwaFo";         // 🔹 Mã câu hỏi
        String message = ";" + studentCode + ";" + qCode; // Theo yêu cầu đề
        int serverPort = 2207;             // 🔹 Cổng UDP của server
        DatagramSocket socket = null;

        try {
            // Khởi tạo socket UDP
            socket = new DatagramSocket();
            socket.setSoTimeout(5000); // Giới hạn thời gian 5 giây
            InetAddress serverAddress = InetAddress.getByName("203.162.10.109");

            // a. Gửi thông điệp định danh đến server
            byte[] sendData = message.getBytes("UTF-8");
            DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length, serverAddress, serverPort);
            socket.send(sendPacket);
            System.out.println(">> Đã gửi đến server:");
            System.out.println(message);

            // b. Nhận phản hồi từ server (requestId;num)
            byte[] receiveData = new byte[1024];
            DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);
            socket.receive(receivePacket);

            String receivedMessage = new String(receivePacket.getData(), 0, receivePacket.getLength(), "UTF-8").trim();
            System.out.println(">> Nhận từ server:");
            System.out.println(receivedMessage);

            // c. Phân tích chuỗi: "requestId;num"
            String[] parts = receivedMessage.split(";");
            if (parts.length != 2) {
                System.out.println("⚠️ Thông điệp nhận được không đúng định dạng.");
                return;
            }

            String requestId = parts[0];
            String numStr = parts[1];

            // Tính tổng các chữ số trong num
            int sum = 0;
            for (char c : numStr.toCharArray()) {
                if (Character.isDigit(c)) {
                    sum += c - '0';
                }
            }

            // d. Tạo chuỗi phản hồi và gửi lại cho server
            String response = requestId + ";" + sum;
            System.out.println(">> Gửi lại kết quả lên server:");
            System.out.println(response);

            byte[] responseData = response.getBytes("UTF-8");
            if (responseData.length > 65535) {
                System.out.println("⚠️ Kích thước gói tin vượt quá giới hạn UDP: " + responseData.length);
                return;
            }

            DatagramPacket responsePacket = new DatagramPacket(responseData, responseData.length, serverAddress, serverPort);
            socket.send(responsePacket);
            System.out.println(">> Đã gửi kết quả thành công.");

        } catch (SocketException e) {
            System.err.println("❌ Lỗi khi tạo socket: " + e.getMessage());
        } catch (UnknownHostException e) {
            System.err.println("❌ Lỗi địa chỉ server: " + e.getMessage());
        } catch (IOException e) {
            System.err.println("❌ Lỗi I/O: " + e.getMessage());
        } finally {
            if (socket != null && !socket.isClosed()) {
                socket.close();
                System.out.println(">> Đã đóng kết nối UDP.");
            }
        }
    }
}



5)TCP_CharacterStream
import java.io.*;
import java.net.Socket;
import java.util.ArrayList;

public class _0PruqPwp_TCP_CharacterStream {
    public static void main(String[] args) throws IOException {
        // a. Cấu hình thông tin
        String studentCode = "B22DCCN129";  // 🔹 Mã sinh viên
        String qCode = "0PruqPwp";          // 🔹 Mã câu hỏi
        String host = "203.162.10.109";     // 🔹 Địa chỉ server
        int port = 2208;                    // 🔹 Cổng TCP (theo đề)

        // Tạo socket TCP client
        Socket socket = new Socket(host, port);

        try {
            socket.setSoTimeout(5000);  // Giới hạn thời gian giao tiếp 5s

            // Tạo luồng ký tự (Character Stream)
            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), "UTF-8"));
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), "UTF-8"));

            // a. Gửi chuỗi "studentCode;qCode"
            String message = studentCode + ";" + qCode;
            writer.write(message + "\n");
            writer.flush();
            System.out.println(">> Đã gửi: " + message);

            // b. Nhận chuỗi ngẫu nhiên từ server
            String response = reader.readLine();
            if (response == null) {
                System.out.println("⚠️ Không nhận được dữ liệu từ server.");
                return;
            }
            System.out.println(">> Nhận từ server: " + response);

            // c. Xử lý chuỗi: bỏ ký tự đặc biệt, số, trùng, giữ thứ tự
            String processed = processString(response);
            System.out.println(">> Chuỗi sau khi xử lý: " + processed);

            // d. Gửi lại chuỗi đã xử lý
            writer.write(processed + "\n");
            writer.flush();
            System.out.println(">> Đã gửi lại cho server: " + processed);

        } catch (IOException e) {
            System.err.println("⚠️ Lỗi khi giao tiếp với server: " + e.getMessage());
        } finally {
            socket.close();
            System.out.println(">> Đã đóng kết nối.");
        }
    }

    // 🧩 Hàm xử lý chuỗi theo yêu cầu
    private static String processString(String input) {
        if (input == null) return "";

        ArrayList<Character> seen = new ArrayList<>();
        StringBuilder result = new StringBuilder();

        for (char c : input.toCharArray()) {
            // Giữ lại chữ cái (A-Z, a-z)
            if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) {
                if (!seen.contains(c)) {
                    seen.add(c);
                    result.append(c);
                }
            }
        }
        return result.toString();
    }
}



6) TCP_ByteStream

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.util.ArrayList;

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/**
 *
 * @author pc
 */
public class _6XoOk8wP_TCP_ByteStream {
    public static void main(String[] args) throws IOException {
        String studentCode="B22DCCN129";
        String qCode="6XoOk8wP";
        String host="203.162.10.109";
        Integer port=2206;
        
        Socket socket=new Socket(host, port);
        try {
            socket.setSoTimeout(5000);
            InputStream in=socket.getInputStream();
            OutputStream out=socket.getOutputStream();
            
            String message=studentCode+";"+qCode;
            out.write(message.getBytes("UTF-8"));
            out.flush();
            System.out.println("Da gui "+message);
            
            byte[] buffer=new byte[2048];
            int inread=in.read(buffer);
            if(inread==-1){
                System.out.println("File trong");
            }
            String respone=new String(buffer, 0, inread, "UTF-8").trim();
            int n=Integer.parseInt(respone);
            System.out.println(n);
            ArrayList<Integer> mang=new ArrayList<>();
            mang.add(n);
            int phantu=1;
            while(n!=1){
                if(n%2==0){
                    n=n/2;
                }
                else{
                    n=n*3+1;
                }
                mang.add(n);
                phantu+=1;
            }
            int dodai=mang.size();            
            String result="";
            for(int Number:mang){
                String x=Integer.toString(Number);
                result+=x;
                if(phantu>1){
                    result+=" ";
                    phantu-=1;
                }
            }
            result=result+"; "+dodai;
            
            out.write(result.getBytes("UTF-8"));
            out.flush();
            System.out.println("da gui "+result);
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}



7) UDP_String
/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.io.IOException;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.util.LinkedHashSet;

/**
 *
 * @author pc
 */
public class d02foxUX_UDP_String {
    public static void main(String[] args) {
        String studentCode = "B22DCCN129"; // Thay bằng mã sinh viên của bạn
        String qCode = "d02foxUX";
        String message = ";" + studentCode + ";" + qCode;
        int serverPort = 2208;

        DatagramSocket socket = null;
        try {
            socket = new DatagramSocket();
            InetAddress serverAddress = InetAddress.getByName("203.162.10.109");

            // --- Gửi thông điệp ban đầu ---
            byte[] sendData = message.getBytes();
            DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length, serverAddress, serverPort);
            socket.send(sendPacket);
            System.out.println("Đã gửi đến server: " + message);

            // --- Nhận phản hồi từ server ---
            byte[] receiveData = new byte[1024];
            DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);
            socket.receive(receivePacket);
            String receivedMessage = new String(receivePacket.getData(), 0, receivePacket.getLength(), "UTF-8");
            System.out.println("Nhận từ server: " + receivedMessage);

            // --- Phân tích dữ liệu nhận được ---
            String[] parts = receivedMessage.split(";");
            if (parts.length != 3) {
                System.out.println("Thông điệp nhận được không đúng định dạng!");
                return;
            }

            String requestId = parts[0];
            String str1 = parts[1];
            String str2 = parts[2];

            // --- Xử lý loại bỏ ký tự ---
            String strOutput = removeChars(str1, str2);

            // --- Tạo thông điệp phản hồi ---
            String response = requestId + ";" + strOutput;
            byte[] responseData = response.getBytes("UTF-8");

            // --- Gửi kết quả lên server ---
            DatagramPacket responsePacket = new DatagramPacket(responseData, responseData.length, serverAddress, serverPort);
            socket.send(responsePacket);
            System.out.println("Đã gửi phản hồi: " + response);

            System.out.println("Kết thúc chương trình.");

        } catch (SocketException e) {
            System.err.println("Lỗi khi tạo socket: " + e.getMessage());
        } catch (UnknownHostException e) {
            System.err.println("Không tìm thấy server: " + e.getMessage());
        } catch (IOException e) {
            System.err.println("Lỗi I/O: " + e.getMessage());
        } finally {
            if (socket != null && !socket.isClosed()) {
                socket.close();
            }
        }
    }

    // --- Hàm loại bỏ ký tự đặc biệt và trùng ---
    private static String removeChars(String str1, String str2) {
    // Tạo tập các ký tự xuất hiện trong str2 (case-sensitive)
    java.util.HashSet<Character> forbid = new java.util.HashSet<>();
    for (char c : str2.toCharArray()) {
        forbid.add(c);
    }

    StringBuilder sb = new StringBuilder();
    for (char c : str1.toCharArray()) {
        if (!forbid.contains(c)) {
            sb.append(c);
        }
    }
    return sb.toString();
}
}


8) Lop
package TCP;
import java.io.Serializable;

public class Laptop implements Serializable {
    private static final long serialVersionUID = 20150711L;
    private int id;
    private String code;
    private String name;
    private int quantity;

    public Laptop(int id, String code, String name, int quantity) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.quantity = quantity;
    }

    // Getter & Setter
    public int getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public int getQuantity() { return quantity; }

    public void setId(int id) { this.id = id; }
    public void setCode(String code) { this.code = code; }
    public void setName(String name) { this.name = name; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    @Override
    public String toString() {
        return id + " - " + code + " - " + name + " - " + quantity;
    }
}


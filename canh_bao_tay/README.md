/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

import java.io.*;
import java.net.*;
import UDP.Book;

/**
 *
 * @author pc
 */
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

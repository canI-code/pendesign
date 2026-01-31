import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Create Gmail transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
};

export async function POST(request: NextRequest) {
    try {
        const { email, name } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Store OTP
        otpStore.set(email, { otp, expiresAt });

        // Check if Gmail credentials are configured
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || 
            process.env.GMAIL_USER === 'your_email@gmail.com') {
            // Return OTP in response for demo/development
            console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
            return NextResponse.json({
                success: true,
                message: 'OTP generated (DEV MODE - check console)',
                devMode: true,
                otp: otp, // Only include in dev mode
            });
        }

        // Send email via Gmail SMTP
        const transporter = createTransporter();

        const mailOptions = {
            from: `Campus Hive <${process.env.GMAIL_USER}>`,
            to: email,
            subject: '🎓 Verify your Campus Hive account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 16px 16px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Campus Hive</h1>
                    </div>
                    <div style="background: #1a1a1a; padding: 30px; border-radius: 0 0 16px 16px; color: #e5e5e5;">
                        <h2 style="color: white; margin-top: 0;">Welcome${name ? ', ' + name : ''}! 👋</h2>
                        <p>Your verification code is:</p>
                        <div style="background: #262626; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #a78bfa;">${otp}</span>
                        </div>
                        <p style="color: #a3a3a3; font-size: 14px;">This code expires in 10 minutes.</p>
                        <p style="color: #a3a3a3; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #404040; margin: 20px 0;">
                        <p style="color: #737373; font-size: 12px; text-align: center;">
                            © 2026 Campus Hive. All rights reserved.
                        </p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({
            success: true,
            message: 'OTP sent to your email',
        });
    } catch (error: any) {
        console.error('Send OTP error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send OTP' },
            { status: 500 }
        );
    }
}

// Verify OTP endpoint
export async function PUT(request: NextRequest) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json(
                { error: 'Email and OTP are required' },
                { status: 400 }
            );
        }

        const stored = otpStore.get(email);

        if (!stored) {
            return NextResponse.json(
                { error: 'OTP not found or expired. Please request a new one.' },
                { status: 400 }
            );
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete(email);
            return NextResponse.json(
                { error: 'OTP has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        if (stored.otp !== otp) {
            return NextResponse.json(
                { error: 'Invalid OTP. Please try again.' },
                { status: 400 }
            );
        }

        // OTP verified successfully
        otpStore.delete(email);

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully',
        });
    } catch (error: any) {
        console.error('Verify OTP error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to verify OTP' },
            { status: 500 }
        );
    }
}

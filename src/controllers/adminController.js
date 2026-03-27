const prisma = require('../models/prisma');

async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        full_name: true,
        email: true,
        country: true,
        role: true,
        is_verified: true,
        createdAt: true,
      },
    });

    return res.json({ users });
  } catch (err) {
    console.error('Get all users error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getPartnerRequests(req, res) {
  try {
    const requests = await prisma.partnerRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ requests });
  } catch (err) {
    console.error('Get partner requests error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function approvePartnerRequest(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const request = await prisma.partnerRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ message: 'Partner request not found' });
    }

    if (request.status === 'APPROVED') {
      return res.status(400).json({ message: 'Request already approved' });
    }

    // Create a Centre user from the partner request
    const user = await prisma.user.create({
      data: {
        full_name: request.centre_name,
        email: request.email,
        password: request.password, // already hashed when request was created
        country: request.location,
        role: 'CENTRE',
        is_verified: true,
      },
    });

    await prisma.partnerRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    return res.json({
      message: 'Partner request approved and centre account created',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Approve partner request error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  getAllUsers,
  getPartnerRequests,
  approvePartnerRequest,
};


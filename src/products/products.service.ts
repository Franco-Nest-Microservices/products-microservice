import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService {

  constructor(
    private prisma: PrismaService
  ){}

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto
    })
    return product;
  }

  async findAll(paginationDto: PaginationDto) {
    
    const { page, limit} = paginationDto

    const products = await this.prisma.product.findMany({
      where: {available: true},
      skip: (page!-1) * limit!,
      take: limit,
    })
    
    const total = await this.prisma.product.count()

    return {
      products,
      total,
      currentPage : page,
      totalPages : Math.ceil(total / limit!)
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({where: {id: id, available: true}})
    if(!product) throw new RpcException({status: 404, message: `Product with id ${id} not found`})
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data} = updateProductDto; 
    await this.findOne(id);
    await this.prisma.product.update({
      where: {id},
      data
    })
    return {message : "Product updated successfully"};
  }

  async remove(id: number) {
    await this.findOne(id)
    await this.prisma.product.update({
      where: {id},
      data: {
        available: false
      }
    })
    return {message : "Product deleted successfully"};
  }
}

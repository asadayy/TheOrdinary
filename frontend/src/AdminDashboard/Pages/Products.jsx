import { useEffect, useState } from 'react';
import EditProductForm from './EditProductForm';
import './Styles/Products.css';
import API_URL from '../../config/api';

function Products() {
    const [productData, setProductData] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(10);
    const [totalProducts, setTotalProducts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalType, setModalType] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const url = new URL(`${API_URL}/api/products`);
                url.searchParams.append('page', currentPage);
                url.searchParams.append('limit', productsPerPage);
                if (searchTerm) {
                    url.searchParams.append('search', searchTerm);
                }

                const response = await fetch(url.toString());
                if (!response.ok) {
                    throw new Error('Failed to fetch products.');
                }

                const data = await response.json();

                if (Array.isArray(data.products)) {
                    setProductData(data.products);
                    setFilteredProducts(data.products);
                    setTotalProducts(data.total || data.products.length);
                } else {
                    setProductData([]);
                    setFilteredProducts([]);
                    setTotalProducts(0);
                }

                setError('');
            } catch (err) {
                setError(err.message);
                setProductData([]);
                setFilteredProducts([]);
                setTotalProducts(0);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage, productsPerPage, searchTerm]);

    useEffect(() => {
        const filtered = productData.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = product.category.toLowerCase().includes(searchTerm.toLowerCase());
            return nameMatch || categoryMatch;
        });
        setFilteredProducts(filtered);
    }, [searchTerm, productData]);

    // Reset page to 1 when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.ceil(totalProducts / productsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleView = (product) => {
        setSelectedProduct(product);
        setModalType('view');
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setModalType('edit');
    };

    const handleDelete = (product) => {
        setSelectedProduct(product);
        setModalType('delete');
    };

    const closeModal = () => {
        setSelectedProduct(null);
        setModalType('');
    };

    const confirmDelete = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/products/${selectedProduct._id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete');
            }

            setProductData(prev => prev.filter(p => p.id !== selectedProduct.id));
            setFilteredProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
            closeModal();
        } catch (err) {
            alert('Failed to delete product: ' + err.message);
        }
    };

    if (loading) return <div className="admin-loading">Loading products...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="products-sticky-header">
            <h2>Product Management</h2>
            
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by product name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="products-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Product ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product._id}>
                                <td>{product._id.slice(18, 24)}</td>
                                <td>{product.name}</td>
                                <td>{product.category}</td>
                                <td>${product.price}</td>
                                <td>
                                    <button className="view-details-btn" onClick={() => handleView(product)}>View</button>
                                    <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(product)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProducts.length === 0 && (
                    <div className="no-results">No products found matching your search.</div>
                )}
            </div>

            <div className="pagination-controls">
                <button
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="pagination-btn"
                >
                    Prev
                </button>
                <span className="page-info">{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                >
                    Next
                </button>
            </div>

            {selectedProduct && (
                <div className="product-details-modal">
                    <div className="modal-content">
                        <button
                            className="close-modal-btn"
                            onClick={closeModal}
                        >
                            ×
                        </button>
                        <div className="modal-scroll-content">
                            {modalType === 'view' && (
                                <div className="product-details-view">
                                    <h3>Product Details</h3>
                                    <img
                                        src={`${API_URL}/static/${selectedProduct.image_url}`}
                                        alt={selectedProduct.name}
                                        className="product-image"
                                    />
                                    <div className="product-info">
                                        <p><strong>ID:</strong> {selectedProduct.id}</p>
                                        <p><strong>Name:</strong> {selectedProduct.name}</p>
                                        <p><strong>Category:</strong> {selectedProduct.category}</p>
                                        <p><strong>Price:</strong> ${selectedProduct.price}</p>
                                        <p><strong>Description:</strong> {selectedProduct.description}</p>
                                        <p><strong>Stock Status:</strong> {selectedProduct.stockStatus}</p>
                                        <p><strong>Targets:</strong> {selectedProduct.targets?.join(", ") || "No targets specified"}</p>
                                        <p><strong>Suited To:</strong> {selectedProduct.suitedTo}</p>
                                        <p><strong>Key Ingredients:</strong> {selectedProduct.keyIngredients?.join(", ") || "No ingredients specified"}</p>
                                        <p><strong>Format:</strong> {selectedProduct.format}</p>
                                    </div>
                                </div>
                            )}

                            {modalType === 'edit' && (
                                <EditProductForm
                                    product={selectedProduct}
                                    onClose={closeModal}
                                    onUpdate={(updatedProduct) => {
                                        setProductData(prev =>
                                            prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
                                        );
                                        setFilteredProducts(prev =>
                                            prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
                                        );
                                        closeModal();
                                    }}
                                />
                            )}

                            {modalType === 'delete' && (
                                <div className="delete-confirmation">
                                    <h3>Confirm Delete</h3>
                                    <p>Are you sure you want to delete <strong>{selectedProduct.name}</strong>?</p>
                                    <button className="delete-confirm-btn" onClick={confirmDelete}>Yes, Delete</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Products;

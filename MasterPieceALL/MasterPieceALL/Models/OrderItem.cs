﻿using System;
using System.Collections.Generic;

namespace MasterPieceALL.Models;

public partial class OrderItem
{
    public int OrderitemId { get; set; }

    public int? OrderId { get; set; }

    public int Quantity { get; set; }

    public decimal TotalPrice { get; set; }

    public virtual Order? Order { get; set; }
}
